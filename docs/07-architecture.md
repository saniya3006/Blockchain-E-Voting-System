# Chapter 7: Architecture

## 7.1 Layered architecture

```
                    +----------------------+
                    |      USER            |
                    |  Voter / Admin       |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |   React Frontend     |   pages, components, charts
                    |      Vite            |   (no business rules)
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |      ethers.js       |   ABI encoding, providers,
                    |  Web3 Interaction    |   error decoding
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |      MetaMask        |   private keys, signing,
                    |   Wallet Provider    |   network switching
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | Solidity Smart       |
                    | Contract (Voting.sol)|
                    |  Election Logic      |
                    |  Voting Logic        |
                    |  Candidate Data      |
                    |  Voter Status        |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | Ethereum-Compatible  |   Hardhat node (31337)
                    | Blockchain           |   or Sepolia (11155111)
                    +----------------------+
```

## 7.2 Read path vs write path

```mermaid
flowchart TB
    subgraph Browser
      UI[React UI]
      E[ethers.js]
      MM[MetaMask]
    end
    RPC[(JSON-RPC node<br/>127.0.0.1:8545 / Sepolia RPC)]
    SC[[Voting.sol]]

    UI -- "read: getElectionDetails(), getCandidates(),<br/>hasVoted(), queryFilter(events)" --> E
    E -- "eth_call (free, no wallet)" --> RPC
    UI -- "write: vote(), addCandidate(), ..." --> E
    E -- "eth_sendTransaction" --> MM
    MM -- "signed transaction" --> RPC
    RPC <--> SC
```

- **Read path:** `JsonRpcProvider` sends `eth_call` requests. They are free, need no wallet and do not change state, so anyone can audit the election.
- **Write path:** `BrowserProvider(window.ethereum)` gives a `Signer`. ethers.js estimates gas (this simulation already catches contract errors such as `AlreadyVoted`) and then asks MetaMask to sign and send. The UI waits for the **receipt** (`tx.wait()`) and shows the block number, gas used and fee.

## 7.3 Sequence: casting a vote

```mermaid
sequenceDiagram
    autonumber
    actor V as Voter
    participant UI as React (Candidates page)
    participant E as ethers.js
    participant MM as MetaMask
    participant N as Blockchain node
    participant SC as Voting.sol

    V->>UI: Click "Vote" on Rahul Sharma
    UI->>V: Modal "Are you sure...?"
    V->>UI: Confirm Vote
    UI->>E: contract.vote(1)
    E->>MM: eth_estimateGas / eth_sendTransaction
    MM->>V: Popup: contract interaction + gas fee
    V->>MM: Confirm
    MM->>N: Signed transaction
    N->>SC: Execute vote(1)
    SC->>SC: check phase, time, hasVoted, candidate ID
    SC-->>N: hasVoted[sender]=true, voteCount++, emit VoteCast
    N-->>E: Transaction hash, then receipt (block, gasUsed)
    E-->>UI: Receipt
    UI->>V: "Vote successfully recorded." + tx hash
```

## 7.4 Sequence: rejected double vote

```mermaid
sequenceDiagram
    actor V as Voter (already voted)
    participant E as ethers.js
    participant N as Node
    participant SC as Voting.sol
    V->>E: vote(0)
    E->>N: eth_estimateGas (simulation)
    N->>SC: Execute vote(0)
    SC-->>N: revert AlreadyVoted()
    N-->>E: error data 0x7c9a1cf9
    E-->>V: "This wallet has already voted..."
    Note over V,SC: Nothing is mined, no gas is spent, no state changes
```

## 7.5 Deployment architecture

| Component | Local demo | Sepolia (optional) |
|---|---|---|
| Blockchain | `npx hardhat node` on `127.0.0.1:8545` | Public Sepolia network |
| Contract deployment | `npm run deploy:local` | `npm run deploy:sepolia` |
| Frontend | `npm run dev` on `localhost:5173` | Same, or static hosting of `frontend/dist` |
| Wallet | MetaMask with imported Hardhat accounts | MetaMask with a test account funded from a faucet |
| Explorer | none | sepolia.etherscan.io (links appear automatically) |

## 7.6 Folder structure

```
contracts/Voting.sol          smart contract
scripts/                      deploy, seed demo election, sample votes
test/Voting.test.js           automated tests
frontend/src/context/         Web3Context (wallet + contract state), ThemeContext
frontend/src/utils/           blockchain.js (ethers.js helpers), useNow.js
frontend/src/components/      reusable UI components
frontend/src/pages/           Home, Election, Candidates, Results, Admin, About
frontend/src/contracts/       Voting.json (ABI + address, generated by deploy.js)
```
