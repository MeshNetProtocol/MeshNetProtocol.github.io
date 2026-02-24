// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SupplierVault.sol";
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
    error NotPendingOwner();
    error ZeroAddress();
    error SupplierAlreadyExists();
    error SupplierNotFound();
    error SupplierSuspended();
    error InvalidSupplierId();
    error InvalidYears();
    error InvalidFeeBps();
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

    event OwnershipTransferStarted(address indexed previousOwner, address indexed pendingOwner);
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
    event WithdrawFeeBpsUpdated(uint16 previousFeeBps, uint16 newFeeBps);
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event AnnualFeeCollected(address indexed payer, uint256 amount);

    address public owner;
    address public pendingOwner;

    address public immutable usdc;
    address public treasury;

    uint256 public annualFeeUsdc;
    uint16 public withdrawFeeBps;
    uint16 public immutable maxWithdrawFeeBps;

    mapping(bytes32 => SupplierRecord) private suppliers;
    mapping(address => bytes32) public supplierHashByVault;

    uint256 private constant ONE_YEAR = 365 days;
    uint256 private constant MIN_SUPPLIER_ID_LENGTH = 3;
    uint256 private constant MAX_SUPPLIER_ID_LENGTH = 128;

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    constructor(
        address usdc_,
        address treasury_,
        uint256 annualFeeUsdc_,
        uint16 withdrawFeeBps_,
        uint16 maxWithdrawFeeBps_
    ) {
        if (usdc_ == address(0) || treasury_ == address(0)) {
            revert ZeroAddress();
        }
        if (usdc_.code.length == 0) {
            revert InvalidUsdcContract();
        }
        if (annualFeeUsdc_ == 0) {
            revert InvalidAmount();
        }
        if (maxWithdrawFeeBps_ > 10_000 || withdrawFeeBps_ > maxWithdrawFeeBps_) {
            revert InvalidFeeBps();
        }

        _assertUsdcCompatibility(usdc_);

        owner = msg.sender;
        usdc = usdc_;
        treasury = treasury_;
        annualFeeUsdc = annualFeeUsdc_;
        withdrawFeeBps = withdrawFeeBps_;
        maxWithdrawFeeBps = maxWithdrawFeeBps_;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) {
            revert ZeroAddress();
        }
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) {
            revert NotPendingOwner();
        }

        address previousOwner = owner;
        owner = msg.sender;
        pendingOwner = address(0);
        emit OwnershipTransferred(previousOwner, msg.sender);
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

    function setWithdrawFeeBps(uint16 newFeeBps) external onlyOwner nonReentrant {
        if (newFeeBps > maxWithdrawFeeBps) {
            revert InvalidFeeBps();
        }

        uint16 oldFeeBps = withdrawFeeBps;
        withdrawFeeBps = newFeeBps;
        emit WithdrawFeeBpsUpdated(oldFeeBps, newFeeBps);
    }

    function setTreasury(address newTreasury) external onlyOwner nonReentrant {
        if (newTreasury == address(0)) {
            revert ZeroAddress();
        }

        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function getFeeConfig() external view returns (address feeTreasury, uint16 feeBps) {
        return (treasury, withdrawFeeBps);
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
        _validateSupplierId(supplierId);

        supplierIdHash = keccak256(bytes(supplierId));
        if (suppliers[supplierIdHash].owner != address(0)) {
            revert SupplierAlreadyExists();
        }

        SupplierVault supplierVault = new SupplierVault(address(this), supplierIdHash);
        vault = address(supplierVault);

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

    function _validateSupplierId(string calldata supplierId) internal pure {
        bytes calldata chars = bytes(supplierId);
        uint256 len = chars.length;
        if (len < MIN_SUPPLIER_ID_LENGTH || len > MAX_SUPPLIER_ID_LENGTH) {
            revert InvalidSupplierId();
        }

        if (chars[0] == 0x2e || chars[len - 1] == 0x2e) {
            revert InvalidSupplierId();
        }

        bool hasDot;
        bytes1 prev;
        for (uint256 i = 0; i < len; i++) {
            bytes1 c = chars[i];

            bool isLower = (c >= 0x61 && c <= 0x7a);
            bool isDigit = (c >= 0x30 && c <= 0x39);
            bool isDot = c == 0x2e;

            if (!(isLower || isDigit || isDot)) {
                revert InvalidSupplierId();
            }
            if (isDot) {
                if (prev == 0x2e) {
                    revert InvalidSupplierId();
                }
                hasDot = true;
            }
            prev = c;
        }

        if (!hasDot) {
            revert InvalidSupplierId();
        }
    }
}
