import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.ONE_INCH_API_KEY;
const CHAIN_ID = 11155111; // Use 1 for Ethereum Mainnet, 11155111 for Sepolia, 43113 for Fuji, etc.

async function getTokens() {
    const url = `https://api.1inch.io/v5.2/${CHAIN_ID}/tokens`;

    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data.tokens;
    } catch (error) {
        console.error("Error fetching tokens:", error.message);
    }
}

(async () => {
    const tokens = await getTokens();

    if (!tokens) {
        console.error("No tokens data received.");
        return;
    }

    console.log("Tokens fetched from 1inch:");

    // Print token symbols and addresses
    Object.entries(tokens).forEach(([address, token]) => {
        console.log(`${token.symbol}: ${address}`);
    });

    // Example: print address of USDC and WETH if found
    const usdc = Object.entries(tokens).find(([_, t]) => t.symbol === "USDC");
    const weth = Object.entries(tokens).find(([_, t]) => t.symbol === "WETH");

    if (usdc) console.log("USDC address:", usdc[0]);
    if (weth) console.log("WETH address:", weth[0]);
})();
