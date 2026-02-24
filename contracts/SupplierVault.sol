// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./utils/ReentrancyGuard.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IProtocolRegistryForVault {
    function usdc() external view returns (address);
    function getFeeConfig() external view returns (address treasury, uint16 withdrawFeeBps);
    function getSupplierOwner(bytes32 supplierIdHash) external view returns (address);
}

contract SupplierVault is ReentrancyGuard {
    error NotSupplierOwner();
    error ZeroAddress();
    error InvalidAmount();
    error TransferFailed();
    error InvalidFeeConfig();
    error InvalidRegistry();
    error InvalidUsdcContract();

    event Withdrawn(
        address indexed caller,
        address indexed to,
        uint256 grossAmount,
        uint256 feeAmount,
        uint256 netAmount,
        address treasury,
        uint16 feeBps
    );

    address public immutable registry;
    address public immutable usdc;
    bytes32 public immutable supplierIdHash;

    constructor(address registry_, bytes32 supplierIdHash_) {
        if (registry_ == address(0)) {
            revert ZeroAddress();
        }
        if (registry_.code.length == 0) {
            revert InvalidRegistry();
        }

        registry = registry_;
        supplierIdHash = supplierIdHash_;

        address usdc_ = IProtocolRegistryForVault(registry_).usdc();
        if (usdc_ == address(0)) {
            revert ZeroAddress();
        }
        if (usdc_.code.length == 0) {
            revert InvalidUsdcContract();
        }
        (bool okBalance, bytes memory balanceRet) =
            usdc_.staticcall(abi.encodeWithSelector(IERC20.balanceOf.selector, address(this)));
        if (!okBalance || balanceRet.length < 32) {
            revert InvalidUsdcContract();
        }
        usdc = usdc_;
    }

    modifier onlySupplierOwner() {
        address currentOwner = IProtocolRegistryForVault(registry).getSupplierOwner(supplierIdHash);
        if (msg.sender != currentOwner) {
            revert NotSupplierOwner();
        }
        _;
    }

    function previewWithdraw(uint256 amount)
        public
        view
        returns (uint256 feeAmount, uint256 netAmount, address treasury, uint16 feeBps)
    {
        if (amount == 0) {
            revert InvalidAmount();
        }

        (treasury, feeBps) = IProtocolRegistryForVault(registry).getFeeConfig();
        if (treasury == address(0) || feeBps > 10_000) {
            revert InvalidFeeConfig();
        }
        feeAmount = (amount * feeBps) / 10_000;
        netAmount = amount - feeAmount;
    }

    function withdraw(uint256 amount, address to)
        external
        onlySupplierOwner
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
        onlySupplierOwner
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

    function _withdraw(uint256 amount, address to)
        internal
        returns (uint256 feeAmount, uint256 netAmount)
    {
        address treasury;
        uint16 feeBps;
        (feeAmount, netAmount, treasury, feeBps) = previewWithdraw(amount);

        if (feeAmount > 0) {
            _safeTransfer(usdc, treasury, feeAmount);
        }
        _safeTransfer(usdc, to, netAmount);

        emit Withdrawn(msg.sender, to, amount, feeAmount, netAmount, treasury, feeBps);
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
