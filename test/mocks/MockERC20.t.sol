// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../../contracts/mocks/MockERC20.sol";
import "forge-std/Test.sol";

contract MockERC20Test is Test {
    MockERC20 token;

    function setUp() public {
        token = new MockERC20("MockToken", "MTK", 18);
    }

    function testMintAndTransfer() public {
        token.mint(address(this), 1000 ether);
        assertEq(token.balanceOf(address(this)), 1000 ether);
    }
}
