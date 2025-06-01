// File: contracts/oapp/ILayerZeroEndpointV2.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct MessagingFee {
    uint256 nativeFee;
    uint256 lzTokenFee;
}

interface ILayerZeroEndpointV2 {
    function send(
        uint32 dstChainId,
        bytes calldata payload,
        bytes calldata options,
        MessagingFee calldata fee,
        address refundAddress
    ) external payable;
}

