// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockRouter {
    // Simulate 1inch swap call, always succeed
    fallback(bytes calldata) external payable returns (bytes memory) {
        return abi.encode(true);
    }
}
