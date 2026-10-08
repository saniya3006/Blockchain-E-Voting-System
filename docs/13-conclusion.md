# Chapter 13: Conclusion

This project successfully developed **BlockVote**, a decentralized e-voting application built on an Ethereum-compatible blockchain.

The core voting rules are implemented in the **`Voting.sol` smart contract**:

- only the administrator can configure, start and end the election;
- candidates can only be added before voting begins;
- votes are accepted only inside the official voting window;
- each wallet address can vote **only once**;
- every action emits an event, creating a permanent public audit trail.

Because these rules run on the blockchain, they cannot be bypassed by changing the website, and confirmed votes cannot be altered. The **React + ethers.js** frontend with **MetaMask** makes blockchain concepts such as wallet identity, transactions, gas fees, block confirmations and events visible and easy to understand. The contract was verified with **33 automated tests (100% line coverage)**, and the complete flow (admin setup, voting, double-vote rejection, access control, ending the election and results) was demonstrated end-to-end on a local blockchain.

The project also shows clearly what blockchain does **not** solve on its own. It cannot verify that a wallet belongs to a real, eligible person, and on a public blockchain votes are not secret. Solving these problems requires additional techniques such as decentralized identity, zero-knowledge proofs and homomorphic encryption, together with independent audits and legal frameworks.

In conclusion, the project meets its objective of demonstrating how blockchain technology, smart contracts and decentralized applications can improve **transparency, immutability and trust** in an educational voting scenario, while giving an honest picture of the work still needed before such systems could be used in real public elections.
