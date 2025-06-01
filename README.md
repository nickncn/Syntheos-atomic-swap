#  Syntheos: Cross-Chain Atomic Swaps between Ethereum and Solana

> Trustless swaps between EVM and non-EVM chains using hash time-locked contracts (HTLCs) and off-chain relayers.

![Flowchart](./flowchart.png)

##  Overview

Syntheos enables secure, permissionless token swaps across Ethereum and Solana without requiring bridges or centralized exchanges. It leverages **HTLCs** on both chains and uses a **stateless relayer** to ensure atomicity — either both parties complete the swap or both get refunded. No partial state, no broken trades.

Built for developers and inspired by 1inch's **Fusion+** cross-chain escrow design, Syntheos extends the idea to include **non-EVM chains** like Solana, pushing the boundary of composability in cross-chain DeFi.

---

##  Demo Summary

The swap is executed in 4 steps:

1. **Lock on Ethereum**: Alice locks tokens in an EVM HTLC smart contract using a secret hash.
2. **Relayer listens** for the event and triggers Solana HTLC initialization using the same hash.
3. **Claim on Solana**: Bob claims funds on Solana by revealing the secret.
4. **Reveal and Claim on Ethereum**: The secret is extracted by the relayer and submitted to unlock tokens on Ethereum.

Atomicity is guaranteed — either both succeed, or both parties reclaim their funds after a timeout.

---

##  How It's Made

**Core Technologies:**

- **Ethereum Smart Contracts (Solidity)**:
  - Implements a standard HTLC contract supporting locking, claiming with a secret, and refunding.
- **Solana Program (Anchor / Rust)**:
  - Mirrors HTLC logic, including the same secret-based hashlock and timelock mechanism.
- **Node.js Relayer (JavaScript)**:
  - Listens to logs/events on both chains.
  - Submits cross-chain instructions by bridging the secret once it's revealed.
- **Foundry + Anchor**:
  - Used for deployment and testing on each respective chain.
- **Pyth & LayerZero SDKs**:
  - Included for potential oracle-based expansions and messaging interoperability.

**Key Features:**

-  Stateless off-chain relayer logic
-  Cross-chain event listening
-  On-chain HTLC enforcement with timeouts
-  Refund logic baked into both contracts
-  Complete JSON IDL for Solana
-  Gas- and rent-optimized smart contracts

---

##  1inch Prize Track

This project qualifies for:

-  **Extensions for 1inch Cross-chain Swap (Fusion+)**:
  - Implements an HTLC-based escrow system compatible with Fusion+ model
  - Enables a cross-chain swap between Ethereum and Solana
  - Includes refund logic and execution guarantees
  - Demonstrates intent-based trading infrastructure on a non-EVM chain

-  **Utilize 1inch APIs**:
  - Potential to integrate 1inch's Classic Swap or Fusion quote APIs for UI enhancement
  - Extension-ready endpoints in the relayer system

---

## Learnings & Challenges

- Anchor-based programs require strict IDL conformance — debugging misaligned instruction layouts was key.
- Manual decoding of Solana logs for event syncing was surprisingly complex.
- Found edge cases around gas failures, publicKey coercion, and Node.js `esm` quirks.
- Adapted to fallback to manual transaction builders due to Anchor simulation limitations.

---

## How to Run Locally

1. **Clone the repo**
   ```bash
   git clone https://github.com/nickncn/Syntheos-atomic-swap.git
   cd Syntheos-atomic-swap ```

2. **Set up .env**
    ```bash
    cp .env.example .env  ```
    
3.  **Run Relayer**
``` bash
node -r dotenv/config relay/solana-to-evm.js
node -r dotenv/config relay/evm-to-solana.js
```

4. **Trigger Swap (manually or via script)**
``` bash
forge script ...
anchor run initialize
```



Future Work
UI for user-friendly swapping

Token bridging via wrapped mint/burn

Use of 1inch Fusion intent system directly in EVM HTLC

Relayer decentralization and failover

zk-SNARK based secret verification

Team
Built by @nickncn and team at ETHPrague 2025 💥
Powered by 1inch, Solana, and unstoppable determination.

