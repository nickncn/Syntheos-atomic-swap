// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XPToken is ERC20 {
    constructor() ERC20("XPToken", "XP") {}

    // Open minting for hackathon use (no access control)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
    