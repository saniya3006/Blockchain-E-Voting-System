# Chapter 11: Limitations

> **This project is an educational prototype and is not intended for use in real public elections.**

## 11.1 Identity and eligibility

- Blockchain does **not** automatically prove that a real-world voter is eligible. The contract only knows that a transaction was signed by the private key of some address.
- One person can create many wallets and vote many times (a **Sybil attack**). The prototype has no voter registration list or whitelist: any wallet can vote once.
- This prototype does **not** provide government-grade voter authentication (e.g. Aadhaar, voter ID or biometrics).

## 11.2 Privacy

- Wallet addresses are **pseudonymous, not anonymous**. If an address is linked to a person (e.g. through an exchange or a shared address), their vote is revealed.
- *Because transactions on a public blockchain can be inspected, this educational prototype should not be considered a privacy-preserving election system.* Every `VoteCast` event shows the voter address and candidate ID.
- Live tallies are visible to everyone during voting, which could influence later voters.

## 11.3 Coercion and vote-buying

A voter can prove to someone else how they voted (by showing the transaction), so the system does not resist coercion or vote-buying.

## 11.4 Usability and cost

- Voters need a wallet, must understand transactions, and need ETH for gas (free test ETH here; real ETH on mainnet).
- Not accessible for people without smartphones or computers, or with limited technical knowledge.

## 11.5 Trust in the administrator

- The admin chooses the voting window and candidates, and may end the election early. All these actions are publicly logged, but they are still controlled by one key.
- If the admin's private key is lost, the election cannot be started or ended; if it is stolen, the attacker controls the admin functions.

## 11.6 Technical limitations

- One contract handles one election; a new election needs a new deployment.
- The frontend is hosted centrally (localhost or a web server). It cannot break the rules, but it could be unavailable.
- Public testnets can be slow or temporarily unavailable; local Hardhat data is lost when the node restarts.
- The candidate list is stored on-chain; very large elections would raise gas costs for reading and for `getWinner()`.

## 11.7 What a production voting system needs

Identity verification, privacy-preserving voting, independent auditing, accessibility, legal compliance, secure key management, disaster recovery, and much more. See [Chapter 12: Future Scope](12-future-scope.md).
