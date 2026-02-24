// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./utils/ReentrancyGuard.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IProtocolRegistryForProfile {
    function usdc() external view returns (address);
    function getFeeConfig() external view returns (address treasury, uint16 withdrawFeePercent);
    function onProfileOwnerChanged(bytes32 supplierIdHash, address oldOwner, address newOwner) external;
}

contract SupplierProfile is ReentrancyGuard {
    error NotOwner();
    error NotInitialized();
    error AlreadyInitialized();
    error NotRegistry();
    error ZeroAddress();
    error InvalidAmount();
    error TransferFailed();
    error InvalidFeeConfig();
    error InvalidRegistry();
    error InvalidUsdcContract();
    error InvalidSupplierIdHash();
    error SameOwner();

    event Initialized(
        address indexed registry,
        address indexed owner,
        bytes32 indexed supplierIdHash,
        string supplierId,
        string metadataURI
    );
    event OwnerTransferred(address indexed previousOwner, address indexed newOwner);
    event MetadataURIUpdated(string previousMetadataURI, string newMetadataURI);
    event Withdrawn(
        address indexed caller,
        address indexed to,
        uint256 grossAmount,
        uint256 feeAmount,
        uint256 netAmount,
        address treasury,
        uint16 feePercent
    );

    address public registry;
    address public usdc;
    address public owner;
    bytes32 public supplierIdHash;
    string public supplierId;
    string public metadataURI;
    bool public initialized;

    // Lock the implementation instance; clones start with initialized=false.
    constructor() {
        initialized = true;
    }

    function initialize(
        address registry_,
        address owner_,
        string calldata supplierId_,
        bytes32 supplierIdHash_,
        string calldata metadataURI_
    ) external {
        if (initialized) {
            revert AlreadyInitialized();
        }
        if (registry_ == address(0) || owner_ == address(0)) {
            revert ZeroAddress();
        }
        if (msg.sender != registry_) {
            revert NotRegistry();
        }
        if (registry_.code.length == 0) {
            revert InvalidRegistry();
        }
        if (keccak256(bytes(supplierId_)) != supplierIdHash_) {
            revert InvalidSupplierIdHash();
        }

        address usdc_ = IProtocolRegistryForProfile(registry_).usdc();
        if (usdc_ == address(0) || usdc_.code.length == 0) {
            revert InvalidUsdcContract();
        }
        (bool okBalance, bytes memory balanceRet) =
            usdc_.staticcall(abi.encodeWithSelector(IERC20.balanceOf.selector, address(this)));
        if (!okBalance || balanceRet.length < 32) {
            revert InvalidUsdcContract();
        }

        registry = registry_;
        usdc = usdc_;
        owner = owner_;
        supplierIdHash = supplierIdHash_;
        supplierId = supplierId_;
        metadataURI = metadataURI_;
        initialized = true;

        emit Initialized(registry_, owner_, supplierIdHash_, supplierId_, metadataURI_);
    }

    modifier onlyInitialized() {
        if (!initialized) {
            revert NotInitialized();
        }
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function transferOwner(address newOwner) external onlyInitialized onlyOwner nonReentrant {
        if (newOwner == address(0)) {
            revert ZeroAddress();
        }
        if (newOwner == owner) {
            revert SameOwner();
        }

        address previousOwner = owner;
        owner = newOwner;
        IProtocolRegistryForProfile(registry).onProfileOwnerChanged(supplierIdHash, previousOwner, newOwner);

        emit OwnerTransferred(previousOwner, newOwner);
    }

    function setMetadataURI(string calldata newMetadataURI) external onlyInitialized onlyOwner {
        string memory oldMetadataURI = metadataURI;
        metadataURI = newMetadataURI;
        emit MetadataURIUpdated(oldMetadataURI, newMetadataURI);
    }

    function previewWithdraw(uint256 amount)
        public
        view
        onlyInitialized
        returns (uint256 feeAmount, uint256 netAmount, address treasury, uint16 feePercent)
    {
        if (amount == 0) {
            revert InvalidAmount();
        }

        (treasury, feePercent) = IProtocolRegistryForProfile(registry).getFeeConfig();
        if (treasury == address(0) || feePercent > 100) {
            revert InvalidFeeConfig();
        }

        feeAmount = (amount * feePercent) / 100;
        netAmount = amount - feeAmount;
    }

    function withdraw(uint256 amount, address to)
        external
        onlyInitialized
        onlyOwner
        nonReentrant
        returns (uint256 feeAmount, uint256 netAmount)
    {
        if (to == address(0)) {
            revert ZeroAddress();
        }
        (feeAmount, netAmount) = _withdraw(amount, to);
    }

    function withdrawAll(address to)
        external
        onlyInitialized
        onlyOwner
        nonReentrant
        returns (uint256 feeAmount, uint256 netAmount)
    {
        if (to == address(0)) {
            revert ZeroAddress();
        }

        uint256 amount = IERC20(usdc).balanceOf(address(this));
        if (amount == 0) {
            return (0, 0);
        }
        (feeAmount, netAmount) = _withdraw(amount, to);
    }

    function _withdraw(uint256 amount, address to) internal returns (uint256 feeAmount, uint256 netAmount) {
        address treasury;
        uint16 feePercent;
        (feeAmount, netAmount, treasury, feePercent) = previewWithdraw(amount);

        if (feeAmount > 0) {
            _safeTransfer(usdc, treasury, feeAmount);
        }
        _safeTransfer(usdc, to, netAmount);

        emit Withdrawn(msg.sender, to, amount, feeAmount, netAmount, treasury, feePercent);
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory returndata) =
            token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        if (!success) {
            revert TransferFailed();
        }
        if (returndata.length > 0 && !abi.decode(returndata, (bool))) {
            revert TransferFailed();
        }
    }
}
