# Chapter 10: Results

## 10.1 Outcome

The project produced a complete, working decentralized e-voting application:

- A Solidity smart contract that enforces all election rules on-chain.
- Deployment scripts that configure the frontend automatically.
- A responsive React dApp with landing page, election dashboard, ballot, results dashboard, admin dashboard and about page.
- 33 automated tests with 100% line coverage.

## 10.2 Demonstration election

| Item | Value |
|---|---|
| Election | Student Council Election 2026 |
| Candidates | Alice Johnson (ID 0), Rahul Sharma (ID 1), Priya Nair (ID 2), Arjun Mehta (ID 3) |
| Voting window | 7 days from the seed script |
| Sample votes | 6 (Alice 2, Rahul 2, Priya 1, Arjun 1) |
| Live vote in demo | Voter 1 votes for Rahul Sharma |

**Final result after the admin ends the election**

| Rank | Candidate | Votes | Percentage |
|---|---|---|---|
| 1 | 🏆 Rahul Sharma | 3 | 42.9% |
| 2 | Alice Johnson | 2 | 28.6% |
| 3 | Priya Nair | 1 | 14.3% |
| 3 | Arjun Mehta | 1 | 14.3% |
| | **Total** | **7** | 100% |

## 10.3 Observations

1. **Transparency:** Anyone could open the Results page and see the same numbers without a wallet; the activity feed listed every `VoteCast` event with its transaction hash and block.
2. **One wallet, one vote:** A second vote from the same wallet was rejected by the smart contract with `AlreadyVoted()` before it reached a block, so no gas was spent and the count did not change.
3. **Access control:** A non-admin wallet calling `endElection()` was rejected with `NotOwner()`, even though the transaction was sent directly (bypassing the hidden button).
4. **Immutability:** Once confirmed, votes could not be edited; candidate registration was locked after the election started.
5. **Cost:** One vote used about 64,000 gas. On the local network and Sepolia this is paid with free test ETH.
6. **User experience:** Every transaction showed clear stages (MetaMask confirmation, pending, confirmed) with the hash, block number, gas used and fee, which made blockchain concepts visible during the demo.

## 10.4 Screenshots

Place screenshots in `docs/screenshots/` (see the README *Screenshots Placeholder* section) for the report:

1. Landing page
2. Election dashboard
3. Candidate cards
4. Vote confirmation modal
5. MetaMask transaction popup
6. Vote success with transaction hash
7. Double-vote rejection
8. Admin dashboard
9. Results with charts and winner
10. Mobile view
