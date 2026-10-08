# Chapter 3: Objectives

## 3.1 Main objective

To build a working decentralized e-voting application that demonstrates how blockchain and smart contracts can make an election **transparent, tamper-resistant and auditable**.

## 3.2 Specific objectives

1. **Smart contract:** Implement the election logic in Solidity: election details, candidate registration, voting window, one vote per wallet, results and winner.
2. **Access control:** Ensure only the administrator (contract owner) can configure, start and end the election, using an `onlyOwner` modifier.
3. **One wallet, one vote:** Prevent double voting with `mapping(address => bool) hasVoted`.
4. **Time-bound voting:** Accept votes only between the start and end time of an active election.
5. **Wallet authentication:** Use MetaMask so voters prove ownership of their address by signing transactions.
6. **Transparency:** Emit events for every important action and display them as a public activity feed.
7. **User interface:** Provide a modern, responsive React interface for voters and administrators with clear status, confirmations and error messages.
8. **Result visualisation:** Show vote counts, percentages, ranking, charts and the winner.
9. **Testing:** Verify every rule with automated Hardhat tests.
10. **Awareness of limitations:** Clearly explain what blockchain voting does *not* solve (identity, privacy, coercion).

## 3.3 Blockchain concepts to be demonstrated

| Concept | Where it appears in the project |
|---|---|
| Blockchain | Votes stored in blocks on the Hardhat / Sepolia network |
| Ethereum-compatible blockchain | EVM networks with chain IDs 31337 and 11155111 |
| Smart contracts / Solidity | `contracts/Voting.sol` |
| Decentralization | No backend server or database; state lives on the chain |
| Immutability | Confirmed votes cannot be modified |
| Wallet authentication | `msg.sender` from MetaMask signatures |
| Transactions and gas fees | Shown after each vote: hash, block, gas used, fee |
| Events | `VoteCast`, `CandidateAdded`, `ElectionStarted`, `ElectionEnded`, `ElectionConfigured` |
| Web3 / ethers.js | `frontend/src/utils/blockchain.js` |
| React | `frontend/src` |
