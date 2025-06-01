// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EVMHTLC {
    address public sender;
    address public receiver;
    bytes32 public hashLock;
    uint256 public timelock;
    bool public isWithdrawn;
    bool public isRefunded;
    bytes32 public secret;

    event Withdraw(address indexed to, bytes32 secret);
    event Refund(address indexed to);

    constructor(
        address _receiver,
        bytes32 _hashLock,
        uint256 _timelock
    ) payable {
        sender = msg.sender;
        receiver = _receiver;
        hashLock = _hashLock;
        timelock = block.timestamp + _timelock;
        require(msg.value > 0, "Must deposit ETH");
    }

    function withdraw(bytes32 _secret) external {
        require(msg.sender == receiver, "Not receiver");
        require(!isWithdrawn, "Already withdrawn");
        require(!isRefunded, "Already refunded");
        require(sha256(abi.encodePacked(_secret)) == hashLock, "Invalid secret");

        isWithdrawn = true;
        secret = _secret;
        payable(receiver).transfer(address(this).balance);

        emit Withdraw(receiver, _secret);
    }

    function refund() external {
        require(msg.sender == sender, "Not sender");
        require(!isWithdrawn, "Already withdrawn");
        require(!isRefunded, "Already refunded");
        require(block.timestamp >= timelock, "Too early to refund");

        isRefunded = true;
        payable(sender).transfer(address(this).balance);

        emit Refund(sender);
    }
}
