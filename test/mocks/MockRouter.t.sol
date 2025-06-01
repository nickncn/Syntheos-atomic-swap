// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../../contracts/mocks/MockRouter.sol";
import "forge-std/Test.sol";

contract MockRouterTest is Test {
    MockRouter router;

    function setUp() public {
        router = new MockRouter();
    }

    function testFallback() public {
        (bool success, bytes memory ret) = address(router).call(abi.encodeWithSignature("anyFunction()"));
        assertTrue(success);

        bool retBool = abi.decode(ret, (bool));
        assertTrue(retBool);
    }
}
