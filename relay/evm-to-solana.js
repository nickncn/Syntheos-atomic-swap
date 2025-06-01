// relay/evm-to-solana.js
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Transaction, TransactionInstruction } from "@solana/web3.js";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const logPath = path.resolve("relay/logs/evm-to-solana.log");
fs.mkdirSync("relay/logs", { recursive: true });
function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    fs.appendFileSync(logPath, line + "\n");
}

const provider = new ethers.JsonRpcProvider(process.env.EVM_RPC_URL);
const evmHTLC = new ethers.Contract(process.env.EVM_HTLC_ADDRESS, [
    "event Withdraw(address indexed to, bytes32 secret)",
], provider);

const solConnection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
const solProgramId = new PublicKey(process.env.SOLANA_PROGRAM_ID);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SOLANA_KEYPAIR)));
const receiver = new PublicKey(process.env.SOLANA_RECEIVER);

async function submitClaim(secretHex) {
    try {
        const secretBuffer = Buffer.from(secretHex.slice(2), "hex");

        const htlcAccount = new PublicKey(process.env.SOLANA_HTLC_ACCOUNT);

        const ix = new TransactionInstruction({
            keys: [
                { pubkey: htlcAccount, isSigner: false, isWritable: true },
                { pubkey: receiver, isSigner: true, isWritable: true },
            ],
            programId: solProgramId,
            data: secretBuffer,
        });

        const tx = new Transaction().add(ix);
        const sig = await solConnection.sendTransaction(tx, [payer]);
        await solConnection.confirmTransaction(sig, "confirmed");
        log(`Solana claim tx confirmed: ${sig}`);
    } catch (err) {
        log(`❌ Solana claim error: ${err}`);
    }
}

evmHTLC.on("Withdraw", async (_to, secret) => {
    log(`EVM secret revealed: ${secret}`);
    await submitClaim(secret);
});
