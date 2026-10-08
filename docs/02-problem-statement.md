# Chapter 2: Problem Statement

## 2.1 Background

Elections are the foundation of decision-making in governments, universities, companies and clubs. Many organisations have moved from paper ballots to **electronic voting** to save time and cost. However, most electronic voting systems are **centralised**: votes are sent to a server and stored in a database controlled by a single organisation.

## 2.2 Problems with centralised e-voting

| Problem | Explanation |
|---|---|
| Single point of control | Whoever controls the server or database can add, delete or modify votes without anyone noticing. |
| Lack of transparency | Voters must trust the announced result; they cannot independently recount the votes. |
| Weak audit trail | Server logs can be edited or deleted, so it is hard to prove that the process was fair. |
| Single point of failure | If the server crashes or is attacked, the election stops. |
| Double voting | Preventing one person from voting twice depends entirely on correct server code that voters cannot inspect. |

## 2.3 Problem statement

> *To design and develop a decentralized application (dApp) for e-voting in which the election rules are enforced by a smart contract on an Ethereum-compatible blockchain, so that each wallet can vote only once within the official voting period, only the administrator can manage the election, and every vote is recorded as an immutable, publicly verifiable blockchain transaction.*

## 2.4 Scope

**In scope**

- One election per deployed smart contract, with a title, description, start time and end time.
- Administrator functions: configure the election, add candidates, start and end it.
- Voter functions: connect a wallet, view candidates, cast one vote, view their status and results.
- Result display with charts and winner.
- Local blockchain (Hardhat) and Sepolia testnet support.

**Out of scope** (documented as limitations)

- Verification of real-world voter identity (e.g. Aadhaar or student ID).
- Secret or anonymous ballots.
- Use in real public or government elections.
