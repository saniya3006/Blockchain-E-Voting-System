# Chapter 1: Abstract

The **Decentralized E-Voting System** (BlockVote) is a blockchain-based decentralized application (dApp) designed to demonstrate transparent and tamper-resistant electronic voting.

The system uses a smart contract written in **Solidity** and deployed on an **Ethereum-compatible blockchain** (a local Hardhat network or the Sepolia test network) to manage elections, candidates and votes. The administrator, who is the account that deploys the contract, configures the election title, description and voting period, registers candidates, and starts and ends the election. Only the administrator can perform these operations; the restriction is enforced inside the smart contract with an `onlyOwner` modifier.

Voters interact with the application through a Web3 wallet such as **MetaMask**. The wallet address acts as the voter's identity, and the smart contract keeps a `hasVoted` mapping so that each wallet can vote **only once**. Votes are accepted only while the election is active and within its start and end time. Every vote is a signed blockchain transaction and emits a `VoteCast` event, so the system provides an **auditable and immutable record** of all voting activity that anyone can verify.

A **React** frontend built with **Vite**, **Tailwind CSS** and **ethers.js** provides interfaces for administrators, voters and result visualisation. It shows election status with a live countdown, candidate cards, a step-by-step voting dialog with the transaction hash, block number and gas fee, a public activity feed built from contract events, and a results dashboard with charts, percentages and the winner.

The smart contract is verified by **33 automated tests** with 100% line coverage. The project demonstrates how blockchain technology, smart contracts and decentralized applications can be combined to improve transparency and trust in an educational voting scenario. It also clearly documents the limitations of such a system: it does not verify real-world voter identity and does not provide a secret ballot, so it is **not intended for use in real public elections**.

**Keywords:** Blockchain, Ethereum, Smart Contract, Solidity, dApp, E-Voting, MetaMask, ethers.js, React, Hardhat.
