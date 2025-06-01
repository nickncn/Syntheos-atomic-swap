import { ethers } from "hardhat";
import { expect } from "chai";
import { parseEther } from "ethers";
import "@nomicfoundation/hardhat-chai-matchers";

async function parseEventArgs(receipt: any, contract: any, eventName: string) {
    const event = contract.interface.getEvent(eventName);
    const topic = contract.interface.getEventTopic(event);

    for (const log of receipt.logs) {
        if (log.topics[0] === topic) {
            const parsed = contract.interface.parseLog(log);
            return parsed.args;
        }
    }
    throw new Error(`Event "${eventName}" not found in logs.`);
}

describe("Vault: depositAndSwap (1inch)", function () {
    let vault: any;

    const ONE_INCH_ROUTER = "0x1111111254EEB25477B68fb85Ed929f73A960582"; // 1inch mainnet
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Mainnet USDC

    beforeEach(async () => {
        const Vault = await ethers.getContractFactory("Vault");
        vault = await Vault.deploy();
        await vault.waitForDeployment();
        await vault.setOneInchRouter(ONE_INCH_ROUTER);
    });

    it("should swap ETH into USDC using 1inch", async () => {
        const [user] = await ethers.getSigners();

        const oneInchApiURL = `https://api.1inch.dev/swap/v5.2/1/swap`;
        const params = new URLSearchParams({
            src: "ETH",
            dst: USDC,
            amount: parseEther("0.01").toString(),
            from: user.address,
            slippage: "1",
        });

        const res = await fetch(`${oneInchApiURL}?${params}`, {
            headers: {
                Authorization: `Bearer ${process.env.ONE_INCH_API_KEY!}`,
            },
        });
        const json = await res.json();

        const txData = json.tx.data;
        const minReturn = 0;

        const tx = await vault.connect(user).depositAndSwap(
            USDC,
            minReturn,
            txData,
            { value: parseEther("0.01") }
        );

        const receipt = await tx.wait();

        const eventArgs = await parseEventArgs(receipt, vault, "Deposited");
        console.log("✅ Event decoded:", eventArgs);

        const vaultBal = await vault.getVaultBalance();
        expect(vaultBal > 0n).to.be.true;
    });
});
