// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SupplierProfile.sol";
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

interface ISupplierProfileView {
    function owner() external view returns (address);
}

contract ProtocolRegistry is ReentrancyGuard {
    error NotOwner();
    error NotProfile();
    error ZeroAddress();
    error SupplierAlreadyExists(address existingOwner);
    error SupplierNotFound();
    error SupplierSuspended();
    error OwnerSyncMismatch(address expected, address actual);
    error InvalidFeePercent();
    error InvalidAmount();
    error InvalidUsdcContract();
    error InvalidUsdcBalanceOf();
    error InvalidUsdcAuthorizationState();
    error UsdcReceiveWithAuthorizationFailed();
    error UsdcTransferFailed();

    struct SupplierRecord {
        string supplierId;
        address profile;
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
        address indexed profile,
        string metadataURI,
        uint64 expiry
    );
    event SupplierRenewed(bytes32 indexed supplierIdHash, uint64 newExpiry);
    event SupplierStatusChanged(bytes32 indexed supplierIdHash, bool suspended);
    event SupplierOwnerIndexUpdated(bytes32 indexed supplierIdHash, address indexed previousOwner, address indexed newOwner);

    event AnnualFeeUpdated(uint256 previousFee, uint256 newFee);
    event WithdrawFeePercentUpdated(uint16 previousFeePercent, uint16 newFeePercent);
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event AnnualFeeCollected(address indexed payer, uint256 amount);
    event ProfileImplementationDeployed(address indexed implementation);

    address public owner;

    address public immutable usdc;
    address public immutable profileImplementation;
    address public treasury;

    uint256 public annualFeeUsdc;
    uint16 public withdrawFeePercent;

    mapping(bytes32 => SupplierRecord) private suppliers;
    mapping(address => bytes32) public supplierHashByProfile;
    mapping(bytes32 => address) private indexedOwnerBySupplier;
    mapping(address => bytes32[]) private supplierHashesByOwner;
    mapping(bytes32 => uint256) private supplierIndexInOwnerListPlusOne;

    uint256 private constant ONE_YEAR = 365 days;
    uint256 private constant DEFAULT_ANNUAL_FEE_USDC = 300_000_000; // 300 USDC (6 decimals)
    uint16 private constant DEFAULT_WITHDRAW_FEE_PERCENT = 10; // 10%

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    // Base USDC defaults:
    // - Base Mainnet (chainId=8453): 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
    // - Base Sepolia (chainId=84532): 0x036CbD53842c5426634e7929541eC2318f3dCf7
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
        profileImplementation = address(new SupplierProfile());
        treasury = msg.sender;
        annualFeeUsdc = DEFAULT_ANNUAL_FEE_USDC;
        withdrawFeePercent = DEFAULT_WITHDRAW_FEE_PERCENT;

        emit ProfileImplementationDeployed(profileImplementation);
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
    ) external nonReentrant returns (bytes32 supplierIdHash, address profile) {
        _collectAnnualFeeWithAuthorization(msg.sender, paymentAuthorization);
        (supplierIdHash, profile) = _registerCommercialInternal(msg.sender, supplierId, metadataURI);
    }

    function renewCommercialWithAuthorization(
        bytes32 supplierIdHash,
        TransferAuthorization calldata paymentAuthorization
    ) external nonReentrant {
        _assertRenewable(supplierIdHash);
        _collectAnnualFeeWithAuthorization(msg.sender, paymentAuthorization);
        _extendExpiryOneYear(supplierIdHash);
    }

    function onProfileOwnerChanged(bytes32 supplierIdHash, address oldOwner, address newOwner) external nonReentrant {
        if (newOwner == address(0)) {
            revert ZeroAddress();
        }

        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.profile == address(0)) {
            revert SupplierNotFound();
        }
        if (msg.sender != rec.profile) {
            revert NotProfile();
        }

        address expectedOldOwner = indexedOwnerBySupplier[supplierIdHash];
        if (expectedOldOwner != oldOwner) {
            revert OwnerSyncMismatch(expectedOldOwner, oldOwner);
        }

        address actualNewOwner = ISupplierProfileView(msg.sender).owner();
        if (actualNewOwner != newOwner) {
            revert OwnerSyncMismatch(actualNewOwner, newOwner);
        }

        _removeSupplierFromOwner(oldOwner, supplierIdHash);
        _addSupplierToOwner(newOwner, supplierIdHash);
        indexedOwnerBySupplier[supplierIdHash] = newOwner;

        emit SupplierOwnerIndexUpdated(supplierIdHash, oldOwner, newOwner);
    }

    function suspendSupplier(bytes32 supplierIdHash) external onlyOwner nonReentrant {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.profile == address(0)) {
            revert SupplierNotFound();
        }

        rec.suspended = true;
        emit SupplierStatusChanged(supplierIdHash, true);
    }

    function reactivateSupplier(bytes32 supplierIdHash) external onlyOwner nonReentrant {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.profile == address(0)) {
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
        return indexedOwnerBySupplier[supplierIdHash];
    }

    function getProfileAddress(bytes32 supplierIdHash) external view returns (address) {
        return suppliers[supplierIdHash].profile;
    }

    function getSupplierCountByOwner(address supplierOwner) external view returns (uint256) {
        return supplierHashesByOwner[supplierOwner].length;
    }

    function getSupplierHashesByOwner(address supplierOwner, uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory)
    {
        bytes32[] storage hashes = supplierHashesByOwner[supplierOwner];
        uint256 total = hashes.length;
        if (offset >= total || limit == 0) {
            return new bytes32[](0);
        }

        uint256 endExclusive = offset + limit;
        if (endExclusive > total) {
            endExclusive = total;
        }

        uint256 size = endExclusive - offset;
        bytes32[] memory page = new bytes32[](size);
        for (uint256 i = 0; i < size; i++) {
            page[i] = hashes[offset + i];
        }
        return page;
    }

    function isSupplierActive(bytes32 supplierIdHash) external view returns (bool) {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        return rec.profile != address(0) && !rec.suspended && rec.expiry >= block.timestamp;
    }

    function _collectAnnualFeeWithAuthorization(
        address from,
        TransferAuthorization calldata authorization
    ) internal {
        uint256 amount = annualFeeUsdc;

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
        returns (bytes32 supplierIdHash, address profile)
    {
        supplierIdHash = keccak256(bytes(supplierId));
        address existingOwner = indexedOwnerBySupplier[supplierIdHash];
        if (existingOwner != address(0)) {
            revert SupplierAlreadyExists(existingOwner);
        }

        profile = Clones.clone(profileImplementation);
        SupplierProfile(profile).initialize(address(this), supplierOwner, supplierId, supplierIdHash, metadataURI);

        uint64 expiry = uint64(block.timestamp + ONE_YEAR);
        suppliers[supplierIdHash] = SupplierRecord({supplierId: supplierId, profile: profile, expiry: expiry, suspended: false});
        supplierHashByProfile[profile] = supplierIdHash;
        indexedOwnerBySupplier[supplierIdHash] = supplierOwner;
        _addSupplierToOwner(supplierOwner, supplierIdHash);

        emit SupplierRegistered(supplierIdHash, supplierId, supplierOwner, profile, metadataURI, expiry);
    }

    function _assertRenewable(bytes32 supplierIdHash) internal view {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.profile == address(0)) {
            revert SupplierNotFound();
        }
        if (rec.suspended) {
            revert SupplierSuspended();
        }
    }

    function _extendExpiryOneYear(bytes32 supplierIdHash) internal {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        uint256 base = rec.expiry > block.timestamp ? rec.expiry : block.timestamp;
        rec.expiry = uint64(base + ONE_YEAR);

        emit SupplierRenewed(supplierIdHash, rec.expiry);
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

    function _addSupplierToOwner(address supplierOwner, bytes32 supplierIdHash) internal {
        supplierHashesByOwner[supplierOwner].push(supplierIdHash);
        supplierIndexInOwnerListPlusOne[supplierIdHash] = supplierHashesByOwner[supplierOwner].length;
    }

    function _removeSupplierFromOwner(address supplierOwner, bytes32 supplierIdHash) internal {
        uint256 plusOne = supplierIndexInOwnerListPlusOne[supplierIdHash];
        if (plusOne == 0) {
            return;
        }

        bytes32[] storage hashes = supplierHashesByOwner[supplierOwner];
        uint256 index = plusOne - 1;
        uint256 lastIndex = hashes.length - 1;

        if (index != lastIndex) {
            bytes32 movedHash = hashes[lastIndex];
            hashes[index] = movedHash;
            supplierIndexInOwnerListPlusOne[movedHash] = index + 1;
        }

        hashes.pop();
        delete supplierIndexInOwnerListPlusOne[supplierIdHash];
    }
}
