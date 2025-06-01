// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HTLC {
    address public sender;
    address public recipient;
    bytes32 public hashlock;
    uint256 public timelock;
    bool public withdrawn;
    bool public refunded;
    bytes32 public preimage;

    constructor(address _recipient, bytes32 _hashlock, uint256 _timelock) payable {
        sender = msg.sender;
        recipient = _recipient;
        hashlock = _hashlock;
        timelock = block.timestamp + _timelock;
    }

    function withdraw(bytes32 _preimage) external {
        require(msg.sender == recipient, "Not recipient");
        require(!withdrawn, "Already withdrawn");
        require(sha256(abi.encodePacked(_preimage)) == hashlock, "Invalid preimage");
        withdrawn = true;
        preimage = _preimage;
        payable(recipient).transfer(address(this).balance);
    }

    function refund() external {
        require(msg.sender == sender, "Not sender");
        require(!withdrawn, "Already withdrawn");
        require(block.timestamp > timelock, "Timelock not expired");
        refunded = true;
        payable(sender).transfer(address(this).balance);
    }
}