# Viva and Presentation Kit

## A. 2-minute presentation speech

> Good morning, respected faculty members. Our mini project is the **Decentralized E-Voting System using Blockchain**, which we call **BlockVote**.
>
> In most online voting systems, votes are stored in a central database. Whoever controls that database could change the result, and voters have no way to verify the count. Our project removes that single point of control.
>
> We wrote the election rules as a **smart contract in Solidity** and deployed it on an **Ethereum-compatible blockchain**: a local Hardhat network, with optional deployment to the Sepolia testnet. The contract stores the election details, the candidates, the vote counts and a `hasVoted` mapping. Only the administrator, the account that deployed the contract, can add candidates and start or end the election. Voting is accepted only inside the official time window, and **each wallet can vote only once**. These rules run on the blockchain, so even if someone modifies our website, they cannot break them.
>
> Voters log in with **MetaMask**. Their wallet address is their identity. When they vote, MetaMask asks them to sign a transaction and pay a small gas fee in test ETH. The vote is recorded in a block and a `VoteCast` event is emitted. Our React interface then shows the transaction hash, block number and gas used, and anyone can see the live results, charts and the full activity log, all read directly from the blockchain.
>
> We tested the contract with **33 automated tests** with 100% line coverage.
>
> Finally, we are clear about the limits: blockchain cannot prove a wallet belongs to a real eligible voter, and votes on a public chain are not secret. So this is an **educational prototype, not a system for real public elections**. Future work includes decentralized identity and zero-knowledge proofs for private voting.
>
> Thank you. We will now show a live demonstration.

## B. 5-minute demonstration script

**Before the viva:** terminal 1 `npx hardhat node`; terminal 2 `npm run demo:local`; terminal 3 `cd frontend && npm run dev`. In MetaMask: network *Hardhat Localhost* (31337), accounts #0 (Admin) and #1 (Voter 1) imported, **activity data cleared** (Settings → Advanced). Open `http://localhost:5173`. Select Voter 1 in MetaMask.

| Time | Do | Say |
|---|---|---|
| 0:00 | Show **terminal 1** with the running node | "This is our local Ethereum blockchain. It has 20 test accounts with fake ETH: no real money is involved." |
| 0:20 | Show **terminal 2** deployment output | "We deployed Voting.sol. Here is the contract address, the block and the gas used. The script also created the Student Council Election and cast six sample votes from other test accounts." |
| 0:40 | Browser: **landing page** | "This is BlockVote. Even without a wallet, the page reads the live election directly from the smart contract." |
| 0:55 | Click **Connect Wallet**, approve in MetaMask | "MetaMask asks permission to share my address. This is wallet-based authentication: no username or password." |
| 1:10 | Point to the navbar address, open the dropdown | "My address, network, test ETH balance, my role as Voter, and that I haven't voted yet." |
| 1:25 | **Election** page | "Status Voting Open with a countdown, four candidates, six votes. On the right is the activity feed: every action is a blockchain event with its transaction hash and block number." |
| 1:50 | **Candidates** page | "Each candidate has an on-chain ID, a description and a live vote count." |
| 2:05 | Click **Vote** on Rahul Sharma | "A confirmation dialog, because a vote is final." |
| 2:15 | **Confirm Vote**; MetaMask opens | "Now MetaMask shows the transaction: it calls the `vote` function of our contract and shows the gas fee." |
| 2:30 | Confirm in MetaMask | "The transaction is signed with my private key, which never leaves MetaMask, and sent to the network." |
| 2:40 | Success screen | "Vote successfully recorded. Here is the transaction hash, block number, gas used (about 64,000) and the fee." |
| 2:55 | Close; show **Already Voted** and **Your vote** | "The contract has set `hasVoted` for my address to true." |
| 3:05 | Click **Try to vote again** | "The vote button is hidden, but what if someone bypasses the website? I'm sending a second vote straight to the contract, and it is rejected: *This wallet has already voted*. No vote is counted and no gas is spent." |
| 3:30 | Open **Admin** as Voter 1 → **Try to end the election** | "Only the owner can manage the election. Even if I send the admin transaction directly, the `onlyOwner` modifier rejects it with NotOwner." |
| 3:50 | Switch MetaMask to **Admin (#0)** | "Now I switch to the deployer account. The crown shows the admin role and the dashboard unlocks." |
| 4:00 | Show the phase stepper, locked form and candidate table | "The election is Active, so the details and candidate list are locked on-chain." |
| 4:10 | **End Election** → confirm → MetaMask confirm | "Ending the election is also a transaction. The status changes to Election Ended." |
| 4:25 | **Results** page | "Final results: total votes 7, a bar chart ranking, and a donut chart for vote share." |
| 4:40 | Winner card and ranking table | "The winner is Rahul Sharma with 3 votes, 42.9%. This is verified by calling the contract's `getWinner()` function. Anyone can recount this from the blockchain." |
| 4:50 | **About** page (limitations box) | "To conclude: transparent and tamper-resistant, but not anonymous and without real identity checks. That's why this is an educational prototype. Thank you." |

**If something goes wrong:**
- *Nonce too high* → MetaMask → Settings → Advanced → Clear activity tab data.
- *Contract unavailable* → the node was restarted → `npm run demo:local`.
- MetaMask popup not visible → click the MetaMask icon in the browser toolbar.

## C. Quick viva answers (short form)

| Question | One-line answer |
|---|---|
| Blockchain? | Distributed, append-only ledger of hash-linked blocks agreed by consensus. |
| Why blockchain for voting? | Transparent, tamper-resistant record; rules enforced by code; no central controller. |
| dApp? | App whose backend logic is a smart contract on a blockchain. |
| Smart contract? | Program on the blockchain that runs exactly as written when called by transactions. |
| Why Solidity? | Main EVM language; mature tools; built-in overflow checks since 0.8. |
| Ethereum? | Programmable blockchain running the EVM; gas paid in ETH. |
| MetaMask? | Browser wallet that holds keys and signs transactions (EIP-1193 provider). |
| Wallet address? | 20-byte ID derived from a public key; controlled by the private key. |
| Gas? | Fee for computation (`gasUsed × gasPrice`); a vote is about 64k gas. |
| What happens on vote? | Sign tx → node runs `vote()` → checks → state update + `VoteCast` → block → receipt. |
| Double voting? | `hasVoted[msg.sender]` → `AlreadyVoted()` revert, checked on-chain. |
| How does the contract know the voter? | `msg.sender` from the transaction signature (never `tx.origin`). |
| Immutability? | Changing old data breaks hashes of all later blocks; the network rejects it. |
| Decentralization? | Data and control spread across many nodes; no single point of failure. |
| Transactions? | Signed state changes with a hash, sender, gas fee, block number and receipt. |
| Events? | Contract logs in receipts; cheap, permanent, searchable; used for our activity feed. |
| Why transparent? | All state and events are public; anyone can recount. |
| Anonymous? | No, only pseudonymous: addresses are visible with their votes. |
| Government use? | No: no identity verification, no secret ballot, no audit or legal compliance. |
| MetaMask rejects? | `ACTION_REJECTED`: nothing is sent, no state change, "Transaction rejected by user." |
| Changed frontend? | Rules live in the contract; a modified UI still cannot break them. |
| Better than a database? | No silent edits, public audit trail, rules visible to all, no trusted operator. |
| Real-world improvements? | DID / eligibility, ZK or homomorphic privacy, gasless UX, audits, accessibility, legal framework. |

The full 25 questions with detailed answers are in the [README](../README.md#viva-questions).
