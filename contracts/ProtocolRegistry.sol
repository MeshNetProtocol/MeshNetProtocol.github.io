// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SupplierVault.sol";

interface IERC20TransferFrom {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ProtocolRegistry {
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
    error UsdcTransferFailed();

    struct SupplierRecord {
        string supplierId;
        address owner;
        address vault;
        string metadataURI;
        uint64 expiry;
        bool suspended;
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
        if (maxWithdrawFeeBps_ > 10_000 || withdrawFeeBps_ > maxWithdrawFeeBps_) {
            revert InvalidFeeBps();
        }

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

    function registerCommercial(string calldata supplierId, string calldata metadataURI)
        external
        returns (bytes32 supplierIdHash, address vault)
    {
        _validateSupplierId(supplierId);

        supplierIdHash = keccak256(bytes(supplierId));
        if (suppliers[supplierIdHash].owner != address(0)) {
            revert SupplierAlreadyExists();
        }

        _collectAnnualFee(msg.sender, 1);

        SupplierVault supplierVault = new SupplierVault(address(this), supplierIdHash);
        vault = address(supplierVault);

        uint64 expiry = uint64(block.timestamp + ONE_YEAR);
        suppliers[supplierIdHash] = SupplierRecord({
            supplierId: supplierId,
            owner: msg.sender,
            vault: vault,
            metadataURI: metadataURI,
            expiry: expiry,
            suspended: false
        });
        supplierHashByVault[vault] = supplierIdHash;

        emit SupplierRegistered(supplierIdHash, supplierId, msg.sender, vault, metadataURI, expiry);
    }

    function renewCommercial(bytes32 supplierIdHash, uint16 yearsToAdd) external {
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
        if (msg.sender != rec.owner) {
            revert NotOwner();
        }

        _collectAnnualFee(msg.sender, yearsToAdd);

        uint256 base = rec.expiry > block.timestamp ? rec.expiry : block.timestamp;
        rec.expiry = uint64(base + (uint256(yearsToAdd) * ONE_YEAR));

        emit SupplierRenewed(supplierIdHash, rec.expiry, yearsToAdd);
    }

    function updateMetadataURI(bytes32 supplierIdHash, string calldata metadataURI) external {
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

    function transferSupplierOwner(bytes32 supplierIdHash, address newSupplierOwner) external {
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

    function suspendSupplier(bytes32 supplierIdHash) external onlyOwner {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.owner == address(0)) {
            revert SupplierNotFound();
        }

        rec.suspended = true;
        emit SupplierStatusChanged(supplierIdHash, true);
    }

    function reactivateSupplier(bytes32 supplierIdHash) external onlyOwner {
        SupplierRecord storage rec = suppliers[supplierIdHash];
        if (rec.owner == address(0)) {
            revert SupplierNotFound();
        }

        rec.suspended = false;
        emit SupplierStatusChanged(supplierIdHash, false);
    }

    function setAnnualFeeUsdc(uint256 newFee) external onlyOwner {
        if (newFee == 0) {
            revert InvalidAmount();
        }

        uint256 oldFee = annualFeeUsdc;
        annualFeeUsdc = newFee;
        emit AnnualFeeUpdated(oldFee, newFee);
    }

    function setWithdrawFeeBps(uint16 newFeeBps) external onlyOwner {
        if (newFeeBps > maxWithdrawFeeBps) {
            revert InvalidFeeBps();
        }

        uint16 oldFeeBps = withdrawFeeBps;
        withdrawFeeBps = newFeeBps;
        emit WithdrawFeeBpsUpdated(oldFeeBps, newFeeBps);
    }

    function setTreasury(address newTreasury) external onlyOwner {
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

    function _collectAnnualFee(address from, uint16 yearsToAdd) internal {
        uint256 amount = annualFeeUsdc * uint256(yearsToAdd);
        bool ok = IERC20TransferFrom(usdc).transferFrom(from, treasury, amount);
        if (!ok) {
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
