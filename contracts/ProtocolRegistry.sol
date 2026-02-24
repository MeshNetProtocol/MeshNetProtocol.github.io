// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SupplierVault.sol";
import "./utils/Clones.sol";
import "./utils/ReentrancyGuard.sol";

interface IERC20Minimal {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IUSDCReceiveWithAuthorization {
    function receiveWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function authorizationState(address authorizer, bytes32 nonce) external view returns (bool);
}

contract ProtocolRegistry is ReentrancyGuard {
    error NotOwner();
    error ZeroAddress();
    error SupplierAlreadyExists();
    error SupplierNotFound();
    error SupplierSuspended();
    error InvalidYears();
    error InvalidFeePercent();
    error InvalidAmount();
    error InvalidUsdcContract();
    error InvalidUsdcBalanceOf();
    error InvalidUsdcAuthorizationState();
    error UsdcReceiveWithAuthorizationFailed();
    error UsdcTransferFailed();

    struct SupplierRecord {
        string supplierId;
        address owner;
        address vault;
        string metadataURI;
        uint64 expiry;
        bool suspended;
    }

    struct TransferAuthorization {
        uint256 validAfter;
        uint256 validBefore;
        bytes32 nonce;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    event SupplierRegistered(
        bytes32 indexed supplierIdHash,
        string supplierId,
        address indexed supplierOwner,
        address indexed vault,
        string metadataURI,
        uint64 expiry
    );
    event SupplierRenewed(bytes32 indexed supplierIdHash, uint64 newExpiry, uint16 yearsAdded);
    event SupplierMetadataUpdated(bytes32 indexed supplierIdHash, string metadataURI);
    event SupplierOwnerTransferred(bytes32 indexed supplierIdHash, address indexed previousOwner, address indexed newOwner);
    event SupplierStatusChanged(bytes32 indexed supplierIdHash, bool suspended);

    event AnnualFeeUpdated(uint256 previousFee, uint256 newFee);
    event WithdrawFeePercentUpdated(uint16 previousFeePercent, uint16 newFeePercent);
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event AnnualFeeCollected(address indexed payer, uint256 amount);
    event VaultImplementationDeployed(address indexed implementation);

    address public owner;

    address public immutable usdc;
    address public immutable vaultImplementation;
    address public treasury;

    uint256 public annualFeeUsdc;
    uint16 public withdrawFeePercent;

    mapping(bytes32 => SupplierRecord) private suppliers;
    mapping(address => bytes32) public supplierHashByVault;

    uint256 private constant ONE_YEAR = 365 days;
    uint256 private constant DEFAULT_ANNUAL_FEE_USDC = 300_000_000; // 300 USDC (6 decimals)
    uint16 private constant DEFAULT_WITHDRAW_FEE_PERCENT = 10; // 10%

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    constructor(address usdc_) {
        if (usdc_ == address(0)) {
            revert ZeroAddress();
        }
        if (usdc_.code.length == 0) {
            revert InvalidUsdcContract();
        }

        _assertUsdcCompatibility(usdc_);

        owner = msg.sender;
        usdc = usdc_;
        vaultImplementation = address(new SupplierVault());
        treasury = msg.sender;
        annualFeeUsdc = DEFAULT_ANNUAL_FEE_USDC;
        withdrawFeePercent = DEFAULT_WITHDRAW_FEE_PERCENT;

        emit VaultImplementationDeployed(vaultImplementation);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) {
            revert ZeroAddress();
        }
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function registerCommercialWithAuthorization(
        string calldata supplierId,
        string calldata metadataURI,
        TransferAuthorization calldata paymentAuthorization
    ) external nonReentrant returns (bytes32 supplierIdHash, address vault) {
        _collectAnnualFeeWithAuthorization(msg.sender, 1, paymentAuthorization);
        (supplierIdHash, vault) = _registerCommercialInternal(msg.sender, supplierId, metadataURI);
    }

    function renewCommercialWithAuthorization(
        bytes32 supplierIdHash,
        uint16 yearsToAdd,
        TransferAuthorization calldata paymentAuthorization
    ) external nonReentrant {
        _assertRenewableByOwner(supplierIdHash, msg.sender, yearsToAdd);
        _collectAnnualFeeWithAuthorization(msg.sender, yearsToAdd, paymentAuthorization);
        _extendExpiry(supplierIdHash, yearsToAdd);
    }

    function updateMetadataURI(bytes32 supplierIdHash, string calldata metadataURI) external nonReentrant {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.owner == address(0)) {
            revert SupplierNotFound();
        }
        if (msg.sender != rec.owner) {
            revert NotOwner();
        }

        rec.metadataURI = metadataURI;
        emit SupplierMetadataUpdated(supplierIdHash, metadataURI);
    }

    function transferSupplierOwner(bytes32 supplierIdHash, address newSupplierOwner) external nonReentrant {
        if (newSupplierOwner == address(0)) {
            revert ZeroAddress();
        }

        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.owner == address(0)) {
            revert SupplierNotFound();
        }
        if (msg.sender != rec.owner) {
            revert NotOwner();
        }

        address previousOwner = rec.owner;
        rec.owner = newSupplierOwner;
        emit SupplierOwnerTransferred(supplierIdHash, previousOwner, newSupplierOwner);
    }

    function suspendSupplier(bytes32 supplierIdHash) external onlyOwner nonReentrant {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.owner == address(0)) {
            revert SupplierNotFound();
        }

        rec.suspended = true;
        emit SupplierStatusChanged(supplierIdHash, true);
    }

    function reactivateSupplier(bytes32 supplierIdHash) external onlyOwner nonReentrant {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.owner == address(0)) {
            revert SupplierNotFound();
        }

        rec.suspended = false;
        emit SupplierStatusChanged(supplierIdHash, false);
    }

    function setAnnualFeeUsdc(uint256 newFee) external onlyOwner nonReentrant {
        if (newFee == 0) {
            revert InvalidAmount();
        }

        uint256 oldFee = annualFeeUsdc;
        annualFeeUsdc = newFee;
        emit AnnualFeeUpdated(oldFee, newFee);
    }

    function setWithdrawFeePercent(uint16 newFeePercent) external onlyOwner nonReentrant {
        if (newFeePercent > 100) {
            revert InvalidFeePercent();
        }

        uint16 oldFeePercent = withdrawFeePercent;
        withdrawFeePercent = newFeePercent;
        emit WithdrawFeePercentUpdated(oldFeePercent, newFeePercent);
    }

    function setTreasury(address newTreasury) external onlyOwner nonReentrant {
        if (newTreasury == address(0)) {
            revert ZeroAddress();
        }

        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function getFeeConfig() external view returns (address feeTreasury, uint16 feePercent) {
        return (treasury, withdrawFeePercent);
    }

    function getSupplier(bytes32 supplierIdHash) external view returns (SupplierRecord memory) {
        return suppliers[supplierIdHash];
    }

    function getSupplierById(string calldata supplierId) external view returns (SupplierRecord memory) {
        return suppliers[keccak256(bytes(supplierId))];
    }

    function getSupplierOwner(bytes32 supplierIdHash) external view returns (address) {
        return suppliers[supplierIdHash].owner;
    }

    function isSupplierActive(bytes32 supplierIdHash) external view returns (bool) {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        return rec.owner != address(0) && !rec.suspended && rec.expiry >= block.timestamp;
    }

    function _collectAnnualFeeWithAuthorization(
        address from,
        uint16 yearsToAdd,
        TransferAuthorization calldata authorization
    ) internal {
        uint256 amount = annualFeeUsdc * uint256(yearsToAdd);

        try IUSDCReceiveWithAuthorization(usdc).receiveWithAuthorization(
            from,
            address(this),
            amount,
            authorization.validAfter,
            authorization.validBefore,
            authorization.nonce,
            authorization.v,
            authorization.r,
            authorization.s
        ) {} catch {
            revert UsdcReceiveWithAuthorizationFailed();
        }

        _safeTransfer(usdc, treasury, amount);
        emit AnnualFeeCollected(from, amount);
    }

    function _registerCommercialInternal(address supplierOwner, string calldata supplierId, string calldata metadataURI)
        internal
        returns (bytes32 supplierIdHash, address vault)
    {
        supplierIdHash = keccak256(bytes(supplierId));
        if (suppliers[supplierIdHash].owner != address(0)) {
            revert SupplierAlreadyExists();
        }

        vault = Clones.clone(vaultImplementation);
        SupplierVault(vault).initialize(address(this), supplierIdHash);

        uint64 expiry = uint64(block.timestamp + ONE_YEAR);
        suppliers[supplierIdHash] = SupplierRecord({
            supplierId: supplierId,
            owner: supplierOwner,
            vault: vault,
            metadataURI: metadataURI,
            expiry: expiry,
            suspended: false
        });
        supplierHashByVault[vault] = supplierIdHash;

        emit SupplierRegistered(supplierIdHash, supplierId, supplierOwner, vault, metadataURI, expiry);
    }

    function _assertRenewableByOwner(bytes32 supplierIdHash, address caller, uint16 yearsToAdd) internal view {
        if (yearsToAdd == 0) {
            revert InvalidYears();
        }

        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.owner == address(0)) {
            revert SupplierNotFound();
        }
        if (rec.suspended) {
            revert SupplierSuspended();
        }
        if (caller != rec.owner) {
            revert NotOwner();
        }
    }

    function _extendExpiry(bytes32 supplierIdHash, uint16 yearsToAdd) internal {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        uint256 base = rec.expiry > block.timestamp ? rec.expiry : block.timestamp;
        rec.expiry = uint64(base + (uint256(yearsToAdd) * ONE_YEAR));

        emit SupplierRenewed(supplierIdHash, rec.expiry, yearsToAdd);
    }

    function _assertUsdcCompatibility(address token) internal view {
        (bool okBalance, bytes memory balanceRet) =
            token.staticcall(abi.encodeWithSelector(IERC20Minimal.balanceOf.selector, address(this)));
        if (!okBalance || balanceRet.length < 32) {
            revert InvalidUsdcBalanceOf();
        }

        (bool okAuth, bytes memory authRet) = token.staticcall(
            abi.encodeWithSelector(IUSDCReceiveWithAuthorization.authorizationState.selector, address(this), bytes32(0))
        );
        if (!okAuth || authRet.length < 32) {
            revert InvalidUsdcAuthorizationState();
        }
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory returndata) =
            token.call(abi.encodeWithSelector(IERC20Minimal.transfer.selector, to, amount));
        if (!success) {
            revert UsdcTransferFailed();
        }
        if (returndata.length > 0 && !abi.decode(returndata, (bool))) {
            revert UsdcTransferFailed();
        }
    }
}
