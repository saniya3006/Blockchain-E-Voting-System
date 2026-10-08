# Chapter 9: Testing

## 9.1 Testing strategy

| Level | Tool | What is tested |
|---|---|---|
| Unit tests (smart contract) | Hardhat + Mocha + Chai + network helpers | Every function, rule and error of `Voting.sol` |
| Coverage | `solidity-coverage` (`npx hardhat coverage`) | Which statements and branches the tests execute |
| Build check | `vite build` | Frontend compiles without errors |
| End-to-end (manual / browser) | Browser + local Hardhat node | Complete user and admin flows |

Hardhat's **network helpers** (`time.increaseTo`, `loadFixture`) let the tests move blockchain time forward to test "before start" and "after end" without waiting.

## 9.2 Running the tests

```bash
npx hardhat test
npx hardhat coverage
```

## 9.3 Unit test cases

| # | Test case | Expected result | Status |
|---|---|---|---|
| 1 | Deploy contract | Valid address | ✅ Pass |
| 2 | Owner assignment | `owner == deployer` | ✅ Pass |
| 3 | Initial state | Setup phase, 0 candidates, 0 votes, "Not Started" | ✅ Pass |
| 4 | Configure election | Values stored, `ElectionConfigured` emitted | ✅ Pass |
| 5 | Empty title | Revert `EmptyField("title")` | ✅ Pass |
| 6 | Invalid time range | Revert `InvalidTimeRange` | ✅ Pass |
| 7 | Reconfigure after start | Revert `InvalidPhase` | ✅ Pass |
| 8 | Add candidates | IDs 0, 1, ...; `CandidateAdded` emitted | ✅ Pass |
| 9 | Get candidate by ID | Correct candidate returned | ✅ Pass |
| 10 | Get unknown candidate | Revert `InvalidCandidate(99)` | ✅ Pass |
| 11 | Empty candidate name | Revert `EmptyField("name")` | ✅ Pass |
| 12 | Add candidate after start | Revert `InvalidPhase` | ✅ Pass |
| 13 | Start election | Phase Active, `ElectionStarted`, status "Scheduled" | ✅ Pass |
| 14 | Start without title | Revert `EmptyField("title")` | ✅ Pass |
| 15 | Start with 1 candidate | Revert `NotEnoughCandidates` | ✅ Pass |
| 16 | Start after end time passed | Revert `InvalidTimeRange` | ✅ Pass |
| 17 | Start twice | Revert `InvalidPhase` | ✅ Pass |
| 18 | End election | Phase Ended, `ElectionEnded(…, totalVotes)` | ✅ Pass |
| 19 | End before start | Revert `InvalidPhase(Active, Setup)` | ✅ Pass |
| 20 | Valid vote | Count +1, total +1, `hasVoted` true, `VoteCast` emitted | ✅ Pass |
| 21 | **Duplicate vote** | Revert `AlreadyVoted`, counts unchanged | ✅ Pass |
| 22 | **Invalid candidate** | Revert `InvalidCandidate(3)` | ✅ Pass |
| 23 | Vote during setup | Revert `ElectionNotActive` | ✅ Pass |
| 24 | **Vote before start time** | Revert `VotingNotStarted` | ✅ Pass |
| 25 | **Vote after end time** | Revert `VotingPeriodOver`, status "Voting Period Over" | ✅ Pass |
| 26 | Vote after admin ended | Revert `ElectionNotActive` | ✅ Pass |
| 27 | Multiple voters | Counts [1, 1, 2], total 4 | ✅ Pass |
| 28 | **Unauthorized admin calls** | All four admin functions revert `NotOwner` | ✅ Pass |
| 29 | Winner before end | Revert `ResultsNotFinal` | ✅ Pass |
| 30 | Winner after end | Rahul Sharma, 2 votes, no tie | ✅ Pass |
| 31 | Tie detection | `isTie == true` | ✅ Pass |
| 32 | Tie cleared by later leader | Winner ID 2, `isTie == false` | ✅ Pass |
| 33 | Results final after end time | Winner available without `endElection` | ✅ Pass |

**Result:** 33 passing, 0 failing.

## 9.4 Coverage

| File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Voting.sol | 100% | 98.44% | 100% | 100% |

## 9.5 End-to-end test cases (frontend + local blockchain)

| # | Scenario | Expected result | Status |
|---|---|---|---|
| E1 | Open app without MetaMask | Election data shown, "MetaMask is not installed" banner | ✅ Pass |
| E2 | Connect wallet | Short address `0x7099...79C8` in navbar | ✅ Pass |
| E3 | Admin configures election, adds 4 candidates, starts election | Transactions confirmed; form locked after start | ✅ Pass |
| E4 | Vote for Rahul Sharma | Modal stages, "Vote successfully recorded.", 66-char tx hash | ✅ Pass |
| E5 | After voting | "Already Voted" status and "Your vote" badge | ✅ Pass |
| E6 | Try to vote again | Rejected: "This wallet has already voted..." | ✅ Pass |
| E7 | Non-admin tries to end election | Rejected: "Only the election administrator..." | ✅ Pass |
| E8 | Admin ends election | Status "Election Ended" | ✅ Pass |
| E9 | Results | Winner Rahul Sharma (3 votes, 42.9%), verified by `getWinner()` | ✅ Pass |
| E10 | Mobile width 390 px | No horizontal overflow | ✅ Pass |
| E11 | Light and dark theme | Both render correctly | ✅ Pass |

Steps E1–E11 were executed in a Chromium browser connected to a local Hardhat node. The browser wallet was simulated by a provider that forwards requests to the node's unlocked test accounts, so the MetaMask popup itself was not part of this automated run. It should be checked manually during demo preparation (Chapter 10).

## 9.6 Measured gas usage

| Operation | Gas used |
|---|---|
| Deploy | ~1,550,000 |
| configureElection | ~209,000 |
| addCandidate | ~149,000 |
| startElection | ~56,000 |
| vote | ~64,000 |
