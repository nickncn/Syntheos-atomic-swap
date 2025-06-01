// File: contracts/oapp/ILayerZeroReceiver.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Origin {
    uint32 srcEid;
    bytes32 sender;
}

interface ILayerZeroReceiver {
    function lzReceive(
        Origin calldata origin,
        bytes32 guid,
        bytes calldata message,
        address executor,
        bytes calldata extraData
    ) external payable;
}

