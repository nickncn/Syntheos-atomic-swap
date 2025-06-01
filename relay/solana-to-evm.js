// relay/solana-to-evm.js
import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const solConnection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
const solProgramId = new PublicKey(process.env.SOLANA_PROGRAM_ID);

const provider = new ethers.JsonRpcProvider(process.env.EVM_RPC_URL);
const wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY, provider);
const evmHTLC = new ethers.Contract(process.env.EVM_HTLC_ADDRESS, [
  "function withdraw(bytes32 _secret) external",
], wallet);

const logPath = path.resolve("relay/logs/solana-to-evm.log");
fs.mkdirSync("relay/logs", { recursive: true });

async function retryWithdraw(secretHex, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const tx = await evmHTLC.withdraw(secretHex);
      log(`Sent withdraw tx: ${tx.hash}`);
      await tx.wait();
      log(`Withdraw confirmed.`);
      return;
    } catch (err) {
      log(`Retry ${i + 1} failed: ${err}`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logPath, line + "\n");
}

solConnection.onLogs(solProgramId, async (logInfo) => {
  try {
    const log = logInfo.logs.find(l => l.includes("secret"));
    if (!log) return;

    const base58Secret = log.split("secret:")[1].trim();
    const secretBytes = ethers.utils.hexlify(Buffer.from(base58Secret, "base58"));

    log(`Secret found on Solana: ${base58Secret}`);
    await retryWithdraw(secretBytes);
  } catch (err) {
    log(`Error processing Solana event: ${err}`);
  }
}, "confirmed");
