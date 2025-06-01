// scripts/fusion-order.js
import dotenv from "dotenv";
import axios from "axios";
import { parseUnits } from "ethers";

dotenv.config();

console.log("SCRIPT IS STARTING");
console.log("ENV loaded");

const {
    API_KEY,
    USER_ADDRESS,
    TOKEN_IN_SEPOLIA,
    TOKEN_OUT_SEPOLIA,
} = process.env;

console.log("Loaded ENV:", {
    API_KEY: !!API_KEY,
    USER_ADDRESS,
    TOKEN_IN_SEPOLIA,
    TOKEN_OUT_SEPOLIA,
});

const SEPOLIA_CHAIN_ID = 11155111;

async function main() {
    console.log("Running Fusion+ order creation…");
    const payload = {
        fromTokenAddress: TOKEN_IN_SEPOLIA,
        toTokenAddress: TOKEN_OUT_SEPOLIA,
        amount: parseUnits("0.01", 18).toString(),
        fromAddress: USER_ADDRESS,
        recipient: USER_ADDRESS,
        permit: null,
        slippage: 1,
        auctionStartAmount: "1000000", // Example values
        auctionEndAmount: "999999",    // Example values
        duration: 1800
    };

    console.log("Payload:", payload);

    try {
        const res = await axios.post(
            `https://api.1inch.dev/fusion/v1.0/${SEPOLIA_CHAIN_ID}/order`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                }
            }
        );
        console.log("\nFusion+ Order Response from 1inch API:");
        console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.error("Fusion+ API Error:", err.response.data);
        } else {
            console.error("Fusion+ API Unexpected Error:", err.message || err);
        }
    }
}

main().catch(console.error);
