# Chapter 12: Future Scope

## 12.1 Voter eligibility and identity

- **Voter whitelist:** the admin registers eligible addresses (or a Merkle root of them) before the election; `vote()` checks membership.
- **Decentralized Identity (DID) and Verifiable Credentials:** the college issues a signed "eligible student" credential to each student's wallet; the contract or a verifier checks it without storing personal data on-chain.
- **Soulbound (non-transferable) tokens** as voting rights.

## 12.2 Privacy-preserving voting

| Technique | Idea |
|---|---|
| **Commit-reveal voting** | Voters first submit `hash(vote, secret)`; after voting closes they reveal. Hides votes during the election, which prevents live-tally influence. |
| **Zero-Knowledge Proofs** (e.g. Semaphore) | Prove "I am an eligible voter and have not voted" without revealing *which* voter. |
| **MACI** (Minimal Anti-Collusion Infrastructure) | zk-SNARK-based voting that hides votes and makes vote-buying hard. |
| **Homomorphic encryption** | Votes stay encrypted; the tally is computed on encrypted values and only the total is decrypted. |
| **Anonymous credentials / blind signatures** | Separate the identity check from the ballot. |

## 12.3 Usability

- **Gasless voting** with meta-transactions (EIP-2771) or account abstraction (ERC-4337), so voters do not need ETH.
- WalletConnect and mobile wallet support, social-login wallets.
- Multi-language interface, screen-reader accessibility, offline help.

## 12.4 Scalability and cost

- Deploy on **Layer-2 networks** (Polygon, Arbitrum, Optimism, Base) for very low fees.
- **Election factory contract** to create many elections from one deployment, with history.
- Event indexing with The Graph for large elections.

## 12.5 Decentralized hosting and governance

- Host the frontend on **IPFS** / ENS so there is no central web server.
- **Multi-signature admin** (e.g. Safe) so no single person controls the election.
- Time-locks and an election commission role model.

## 12.6 Assurance

- Independent security audits, formal verification of the contract, and bug-bounty programmes.
- Results export and verification tools for independent observers.
