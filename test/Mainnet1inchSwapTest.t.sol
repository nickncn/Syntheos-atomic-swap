// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
}

contract Mainnet1inchSwapTest is Test {
    address constant USER = 0xFaAc141875743347E18748Da3B5fFFF3b749D833;
address constant LINK = 0x514910771AF9Ca656af840dff83E8264EcF986CA;
address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
address constant ONE_INCH_ROUTER = 0x1111111254EEB25477B68fb85Ed929f73A960582;
    uint256 constant AMOUNT_IN = 0.5e18; // 0.5 LINK

    function setUp() public {
        // Fork mainnet
        string memory rpcUrl = vm.envString("MAINNET_RPC");
        vm.createSelectFork(rpcUrl);
        // Fund USER with ETH for gas
        vm.deal(USER, 10 ether);
    }

    function testOneInchSwap() public {
        // Check LINK balance
        uint256 balBefore = IERC20(LINK).balanceOf(USER);
        assertGt(balBefore, AMOUNT_IN, "User must have enough LINK");

        // Approve 1inch router (skipped if already approved on fork)
        vm.prank(USER);
        IERC20(LINK).approve(ONE_INCH_ROUTER, AMOUNT_IN);

        // Paste swap calldata here:
        bytes memory swapCalldata = hex"12aa3caf0000000000000000000000005141b82f5ffda4c6fe1e372978f1c5427640a190000000000000000000000000514910771af9ca656af840dff83e8264ecf986ca000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000005141b82f5ffda4c6fe1e372978f1c5427640a190000000000000000000000000faac141875743347e18748da3b5ffff3b749d83300000000000000000000000000000000000000000000000006f05b59d3b20000000000000000000000000000000000000000000000000000000000000075923e000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fb0000000000000000000000000000000000000000000000000000dd00004e00a0744c8c09514910771af9ca656af840dff83e8264ecf986ca90cbe4bdd538d6e9b379bff5fe72c3d67a521de50000000000000000000000000000000000000000000000000005543df729c0000c20514910771af9ca656af840dff83e8264ecf986cad8c8a2b125527bf97c8e4845b25de7e964468f776ae40711b8002dc6c0d8c8a2b125527bf97c8e4845b25de7e964468f771111111254eeb25477b68fb85ed929f73a960582000000000000000000000000000000000000000000000000000000000075923e514910771af9ca656af840dff83e8264ecf986ca0000000000aea668bc";

        vm.prank(USER);
        (bool success, bytes memory data) = ONE_INCH_ROUTER.call{value: 0}(swapCalldata);

        require(success, "Swap failed!");

        // Check USDC balance increased
        uint256 usdcAfter = IERC20(USDC).balanceOf(USER);
        emit log_named_uint("USDC balance after swap", usdcAfter);
        assertGt(usdcAfter, 0, "User should have more USDC");
    }
}
