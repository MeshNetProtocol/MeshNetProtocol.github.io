// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev Minimal EIP-1167 clone library.
library Clones {
    error CloneFailed();

    function clone(address implementation) internal returns (address instance) {
        assembly ("memory-safe") {
            mstore(0x00, 0x3d602d80600a3d3981f3)
            mstore(0x14, shl(0x60, implementation))
            mstore(0x28, 0x5af43d82803e903d91602b57fd5bf3)
            instance := create(0, 0x09, 0x37)
        }
        if (instance == address(0)) {
            revert CloneFailed();
        }
    }
}

