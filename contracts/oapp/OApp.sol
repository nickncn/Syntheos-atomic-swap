// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { MessagingFee, ILayerZeroEndpointV2 } from "./ILayerZeroEndpointV2.sol";
import { Origin, ILayerZeroReceiver } from "./ILayerZeroReceiver.sol";

abstract contract OApp is ILayerZeroReceiver {
    ILayerZeroEndpointV2 public immutable endpoint;
    address public immutable owner;
    mapping(uint32 => bytes32) public peers;

    constructor(address _endpoint, address _owner) {
        endpoint = ILayerZeroEndpointV2(_endpoint);
        owner = _owner;
    }

    // AeroDump-style peer whitelisting
    function setPeer(uint32 remoteChainId, bytes32 remoteAddress) public {
        require(msg.sender == owner, "Only owner can set peer");
        peers[remoteChainId] = remoteAddress;
    }

    function _lzSend(
        uint32 dstChainId,
        bytes memory payload,
        bytes memory options,
        MessagingFee memory fee,
        address refundAddress
    ) internal {
        endpoint.send{
            value: fee.nativeFee
        }(dstChainId, payload, options, fee, refundAddress);
    }

    // override this in child
    function _lzReceive(
        Origin calldata origin,
        bytes32 guid,
        bytes calldata message,
        address executor,
        bytes calldata extraData
    ) internal virtual {
        revert("OApp: _lzReceive not implemented");
    }
}
