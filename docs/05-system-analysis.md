# Chapter 5: System Analysis

## 5.1 Existing system

In a typical online voting system, a web server authenticates users with a username and password, stores votes in a relational database, and the administrator publishes the result.

**Drawbacks:** central control of data, no public verification, editable logs, single point of failure, and trust required in the operator.

## 5.2 Proposed system

A **decentralized application** where:

- the election rules are written in a **Solidity smart contract** deployed on a blockchain;
- the **blockchain stores all election data** (no database);
- voters sign their votes with **MetaMask**, so each vote is linked to a wallet address;
- the frontend only displays data and builds transactions; it **cannot override** the rules.

**Advantages:** transparent tally, immutable vote record, automatic enforcement of rules, public audit trail through events, no central server to attack or manipulate.

## 5.3 Users (actors)

| Actor | Description |
|---|---|
| Administrator | The wallet that deployed the contract. Configures and controls the election. |
| Voter | Any wallet on the network. Can cast one vote while voting is open. |
| Observer | Anyone (no wallet needed). Can view the election, live results and activity. |

## 5.4 Functional requirements

| ID | Requirement |
|---|---|
| FR1 | The system shall recognise the contract owner as administrator. |
| FR2 | The admin shall set the election title, description, start time and end time. |
| FR3 | The admin shall add candidates (name, description) before the election starts. |
| FR4 | The admin shall start the election (needs a title, ≥ 2 candidates and a future end time). |
| FR5 | The admin shall end the election. |
| FR6 | A voter shall connect a MetaMask wallet and see their address. |
| FR7 | A voter shall view election details, candidates and voting status. |
| FR8 | A voter shall cast exactly one vote while voting is open. |
| FR9 | The system shall display the transaction hash and confirmation after voting. |
| FR10 | The system shall show whether the wallet has already voted. |
| FR11 | Anyone shall view vote counts, percentages, total votes and the winner. |
| FR12 | Non-admin wallets shall be rejected from admin functions. |

## 5.5 Non-functional requirements

| Category | Requirement |
|---|---|
| Security | Rules enforced on-chain; no private keys handled by the app; no personal data on-chain. |
| Transparency | All votes and events publicly readable. |
| Usability | Clear status, confirmations, toast messages and friendly error messages. |
| Responsiveness | Works on desktop and mobile screen sizes. |
| Reliability | Contract verified by automated tests. |
| Cost | Only test ETH used; vote costs about 64,000 gas. |

## 5.6 Feasibility study

- **Technical:** All tools (Solidity, Hardhat, ethers.js, React, MetaMask) are free, open source and well documented.
- **Economic:** No server or hosting costs for development; the local blockchain and Sepolia test ETH are free.
- **Operational:** Users need only a browser with MetaMask; the admin interface needs no technical knowledge after deployment.

## 5.7 Hardware and software requirements

| Type | Requirement |
|---|---|
| Processor / RAM | Any modern dual-core CPU, 4 GB RAM (8 GB recommended) |
| OS | Windows 10/11, macOS or Linux |
| Software | Node.js 18+ and npm, a Chromium-based browser or Firefox with MetaMask, VS Code (optional) |
| Network | Internet for installing packages and the first compile; Sepolia deployment needs an RPC URL |
