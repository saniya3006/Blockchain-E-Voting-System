# Chapter 4: Literature Review

## 4.1 Bitcoin and the blockchain idea

In 2008, Satoshi Nakamoto proposed **Bitcoin**, a peer-to-peer electronic cash system [1]. It introduced the blockchain: a chain of blocks linked by cryptographic hashes and secured by a consensus mechanism (Proof of Work). It showed that a group of untrusted computers can agree on a shared, tamper-resistant ledger without a central authority.

## 4.2 Ethereum and smart contracts

Vitalik Buterin's **Ethereum** white paper (2013) [2] and Gavin Wood's Yellow Paper [3] extended the blockchain with a general-purpose virtual machine, the **Ethereum Virtual Machine (EVM)**. Programs called **smart contracts** can be deployed and executed by every node, which allows decentralized applications (dApps) such as tokens, exchanges and voting systems. In 2022 Ethereum moved from Proof of Work to **Proof of Stake** ("The Merge"), greatly reducing its energy use.

## 4.3 Electronic voting research

- **Traditional e-voting** (EVMs, internet voting) relies on trusted hardware or servers. Studies of deployed internet voting systems have shown serious security weaknesses, mainly because voters and observers cannot verify the software [4].
- **End-to-end verifiable (E2E-V) voting**, e.g. Helios [5], lets voters check that their vote was counted using cryptography (homomorphic encryption, mix-nets) while keeping the ballot secret.
- **Blockchain-based voting** proposals use the blockchain as a public bulletin board. McCorry, Shahandashti and Hao proposed the **Open Vote Network** on Ethereum [6], a boardroom-scale voting protocol that keeps votes private using zero-knowledge proofs, with all logic in a smart contract.
- **MACI** (Minimal Anti-Collusion Infrastructure) by the Ethereum community uses zk-SNARKs to provide privacy and resistance to bribery in on-chain voting [7].
- Several pilot projects (e.g. Voatz, used in some U.S. pilots) attracted security criticism [8], which shows that blockchain alone does not make voting secure. Identity, device security and privacy are equally important.

## 4.4 Comparison

| Approach | Transparency | Tamper resistance | Ballot secrecy | Complexity |
|---|---|---|---|---|
| Paper ballot | Medium (observers) | Medium | High | Low (manual) |
| Centralised e-voting | Low | Low (depends on operator) | Medium | Medium |
| E2E verifiable (Helios) | High | High | High | High |
| **Simple blockchain voting (this project)** | **High** | **High** | **None** | **Medium** |
| Blockchain + ZK (Open Vote, MACI) | High | High | High | Very high |

## 4.5 Gap addressed by this project

Most research systems are mathematically complex and difficult for students to understand and demonstrate. This project focuses on clearly demonstrating the **core blockchain ideas** (smart contract rules, wallet identity, transactions, gas, events, immutability and transparency) in a complete working dApp. It also documents openly that privacy and identity require further techniques (Chapter 12).

## References

See [Chapter 14: References](14-references.md).
