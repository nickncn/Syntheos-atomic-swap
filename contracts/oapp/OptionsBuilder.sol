// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library OptionsBuilder {
    function newOptions() internal pure returns (bytes memory) {
        // This returns an empty options struct. Fill in real logic if needed.
        return new bytes(0);
    }

    function addExecutorLzReceiveOption(bytes memory self, uint256 gas, uint256 value) internal pure returns (bytes memory) {
        // Append or update the options as needed for LayerZero V2.
        // For now, just return self to avoid compile errors.
        return self;
    }
}
