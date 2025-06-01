// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./XPToken.sol";

contract XPVaultAccess {
    XPToken public xpToken;
    uint256 public requiredXP;
    mapping(address => uint256) public deposits;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    constructor(address _xpToken, uint256 _requiredXP) {
        xpToken = XPToken(_xpToken);
        requiredXP = _requiredXP;
    }

    function deposit() external payable {
        require(
            xpToken.balanceOf(msg.sender) >= requiredXP,
            "Not enough XP"
        );
        require(msg.value > 0, "Send ETH");
        deposits[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        deposits[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, amount);
    }

    function vaultBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
