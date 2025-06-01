// get1inchSwapCalldata.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function get1inchSwapCalldata() {
    try {
        const chainId = 1; // Ethereum Mainnet
        const walletAddress = process.env.WALLET_ADDRESS;
        const apiKey = process.env.ONE_INCH_API_KEY;

        // Example tokens:
        const tokenIn = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; // Wrapped ETH (WETH) on mainnet
        const tokenOut = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // ETH (special 1inch address)

        const amount = "10000000000000000"; // 0.01 tokenIn in wei

        const url = `https://api.1inch.io/v5.2/${chainId}/swap?fromTokenAddress=${tokenIn}&toTokenAddress=${tokenOut}&amount=${amount}&fromAddress=${walletAddress}&slippage=1`;

        console.log("Calling 1inch API URL:", url);

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`1inch API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("1inch swap tx data:", data.tx.data);
        return data.tx.data;
    } catch (err) {
        console.error("Error fetching 1inch swap calldata:", err.message);
    }
}

get1inchSwapCalldata();
