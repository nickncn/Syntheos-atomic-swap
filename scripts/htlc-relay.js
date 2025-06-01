
require('dotenv').config();
const { ethers } = require("ethers");
const solanaWeb3 = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');
const fs = require('fs');

// --- CONFIG --- //
const EVM_RPC = process.env.EVM_RPC; // Example: https://mainnet.base.org
const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY; // Your EVM sender's PK
const HTLC_SOL_ABI = require('./HTLC_ABI.json'); // ABI for your Solidity HTLC contract

const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const SOLANA_KEYPAIR_PATH = process.env.SOLANA_KEYPAIR || '/Users/n/my-solana-wallet.json';
const SOLANA_PROGRAM_ID = process.env.SOLANA_PROGRAM_ID; // Solana HTLC program ID
const ANCHOR_IDL = require('./idl.json'); // Anchor IDL for HTLC program

const ethAmount = ethers.parseEther("0.01"); // swap amount
const solAmount = 10000000; // 0.01 SOL (in lamports)
const timelockSeconds = 60 * 30; // 30 min timelock

async function main() {
    // 1. Setup EVM
    const ethProvider = new ethers.JsonRpcProvider(EVM_RPC);
    const ethWallet = new ethers.Wallet(EVM_PRIVATE_KEY, ethProvider);

    // 2. Setup Solana
    const solKeypair = anchor.web3.Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(SOLANA_KEYPAIR_PATH, 'utf8')))
    );
    const solConn = new solanaWeb3.Connection(SOLANA_RPC);
    anchor.setProvider(new anchor.AnchorProvider(solConn, new anchor.Wallet(solKeypair), {}));
    const program = new anchor.Program(ANCHOR_IDL, SOLANA_PROGRAM_ID);

    // --- STEP 1: Generate Secret & Hashlock --- //
    const secret = ethers.randomBytes(32);
    const hashlock = ethers.keccak256(secret); // or ethers.sha256(secret)
    console.log("Secret (hex):", ethers.hexlify(secret));
    console.log("Hashlock:", hashlock);

    // --- STEP 2: Deploy EVM HTLC (if not deployed yet) --- //
    // Optional: deploy new contract, or use deployed HTLC
    // const HTLCFactory = new ethers.ContractFactory(HTLC_SOL_ABI, HTLC_BYTECODE, ethWallet);
    // const htlc = await HTLCFactory.deploy(recipient, hashlock, timelockSeconds, { value: ethAmount });
    // await htlc.waitForDeployment();
    // console.log('EVM HTLC deployed:', htlc.target);
    // For demo, assume contract is already deployed:
    const htlc = new ethers.Contract(process.env.HTLC_ADDRESS, HTLC_SOL_ABI, ethWallet);

    // --- Fund EVM HTLC (lock funds) --- //
    console.log('Locking funds on EVM HTLC...');
    // Note: in this minimal version, the Solidity contract's constructor locks funds
    // If reusing an instance, you'd need a deposit/lock method

    // --- STEP 3: Deploy/init Solana HTLC --- //
    // Derive PDA for HTLC account
    const [htlcPda] = anchor.web3.PublicKey.findProgramAddressSync([
        Buffer.from(hashlock.replace('0x',''), 'hex')
    ], program.programId);

    const unixTime = Math.floor(Date.now() / 1000) + timelockSeconds;

    console.log('Initializing HTLC on Solana...');
    await program.methods.initializeHtlc(
        Array.from(Buffer.from(hashlock.replace('0x',''), 'hex')),
        new anchor.BN(unixTime),
        new anchor.BN(solAmount)
    ).accounts({
        htlc: htlcPda,
        sender: solKeypair.publicKey,
        recipient: new anchor.web3.PublicKey(process.env.SOL_RECIPIENT),
        systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([solKeypair]).rpc();
    console.log('Solana HTLC initialized:', htlcPda.toBase58());

    // --- STEP 4: Listen for claim on Solana and relay preimage to EVM --- //
    console.log('Listening for claim event on Solana...');
    // (Here you may poll the account or listen for an event using Anchor provider)
    let claimed = false;
    let revealedPreimage = null;
    while (!claimed) {
        const htlcAccount = await program.account.htlc.fetch(htlcPda);
        if (htlcAccount.withdrawn) {
            claimed = true;
            revealedPreimage = Buffer.from(htlcAccount.preimage).toString('hex');
            console.log('Claimed! Preimage revealed:', revealedPreimage);
        } else {
            await new Promise(r => setTimeout(r, 15000));
        }
    }

    // --- STEP 5: Use preimage to unlock EVM HTLC --- //
    console.log('Relaying preimage to EVM...');
    const tx2 = await htlc.withdraw('0x'+revealedPreimage);
    await tx2.wait();
    console.log('EVM HTLC claimed with preimage! Tx:', tx2.hash);

    // --- STEP 6: Refund flow (if timeout) --- //
    // Add logic to check timelock and call refund on both sides if needed
}

main().catch(err => console.error(err));