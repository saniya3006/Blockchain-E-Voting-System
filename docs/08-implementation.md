# Chapter 8: Implementation

## 8.1 Development environment

| Tool | Version | Role |
|---|---|---|
| Node.js / npm | 22.x / 10.x (18+ works) | Runtime and package manager |
| Hardhat | 2.22+ with `@nomicfoundation/hardhat-toolbox` 5 | Compile, test, local chain, deploy |
| Solidity compiler | 0.8.24 (optimizer on, 200 runs) | Contract compilation |
| React / Vite | 18.3 / 5.4 | Frontend framework and build tool |
| ethers.js | 6.13+ | Blockchain interaction |
| Tailwind CSS | 3.4 | Styling |
| Recharts, Lucide, react-hot-toast | latest compatible | Charts, icons, notifications |

## 8.2 Smart contract implementation

### Access control

```solidity
address public owner;

constructor() {
    owner = msg.sender;          // deployer becomes administrator
    phase = Phase.Setup;
}

modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner();
    _;
}
```

`msg.sender` is the address that directly called the contract. `tx.origin` is deliberately **not** used, because it can be abused by phishing contracts.

### Phase control

```solidity
modifier inPhase(Phase expected) {
    if (phase != expected) revert InvalidPhase(expected, phase);
    _;
}

function addCandidate(string calldata _name, string calldata _description)
    external onlyOwner inPhase(Phase.Setup) { ... }
```

Candidates and election details can only change in the Setup phase, so the ballot cannot be changed after voting starts.

### Voting

```solidity
function vote(uint256 candidateId) external {
    if (phase != Phase.Active)            revert ElectionNotActive();
    if (block.timestamp < startTime)      revert VotingNotStarted();
    if (block.timestamp > endTime)        revert VotingPeriodOver();
    if (hasVoted[msg.sender])             revert AlreadyVoted();
    if (candidateId >= candidates.length) revert InvalidCandidate(candidateId);

    hasVoted[msg.sender] = true;
    candidates[candidateId].voteCount++;
    totalVotes++;
    emit VoteCast(msg.sender, candidateId);
}
```

### Winner calculation

`getWinner()` loops once over the candidates, keeps the highest vote count, and sets `isTie` when another candidate has the same top count. It only works after the election has ended or the voting period is over (`ResultsNotFinal` otherwise).

## 8.3 Deployment scripts

- **`scripts/deploy.js`** deploys the contract, prints the address, block and gas used, and writes `{ address, chainId, deployBlock, abi }` to `frontend/src/contracts/Voting.json`. So the frontend is always configured automatically.
- **`scripts/seed-demo.js`** configures *"Student Council Election 2026"* using **blockchain time** (`latest block timestamp`) for a 7-day window, adds four candidates and starts the election.
- **`scripts/cast-sample-votes.js`** (local only) casts 6 votes from Hardhat accounts #10–#15, leaving accounts #0–#9 free for live demonstration.

## 8.4 Frontend implementation

### Blockchain utility layer (`utils/blockchain.js`)

```js
// read-only provider - works without a wallet
export function getReadContract() {
  return new Contract(CONTRACT_ADDRESS, VOTING_ABI, getReadProvider());
}

// signer-connected contract - transactions go through MetaMask
export async function getSignerContract() {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, VOTING_ABI, signer);
}
```

It also handles `eth_requestAccounts`, network switching (`wallet_switchEthereumChain`, `wallet_addEthereumChain`), formatting, and **error decoding**: it searches the error for ABI-encoded revert data and decodes custom errors with `contract.interface.parseError()`, turning e.g. `0x7c9a1cf9` into *"This wallet has already voted."*

### Global state (`context/Web3Context.jsx`)

- Restores a previous connection silently with `eth_accounts`, and listens for `accountsChanged` and `chainChanged`.
- Reads `getElectionDetails()`, `getCandidates()` and `hasVoted(account)` every 8 seconds.
- Loads events with `contract.queryFilter("*", deployBlock)` for the activity feed and to find which candidate the wallet voted for.
- `sendTransaction(label, action, onStage)` checks wallet and network, shows toasts, tracks the status (awaiting signature, pending, confirmed or failed), waits for the receipt and returns hash, block, gas used and fee.

### Voting flow (`pages/Candidates.jsx` + `components/VotingModal.jsx`)

```js
await sendTransaction(
  `Vote for ${candidate.name}`,
  (contract) => contract.vote(candidate.id),
  (stage, data) => setModal((m) => ({ ...m, stage, data }))
);
```

The modal moves through *confirm*, *awaiting-signature* ("Confirm this transaction in MetaMask."), *pending* (with tx hash), and then *confirmed* ("Vote successfully recorded.") or *failed*.

### Admin dashboard (`pages/Admin.jsx`)

- Shown only when the connected account equals the on-chain `owner`; others see "Administrator access only" plus a button that sends an admin transaction anyway to show the `NotOwner()` rejection.
- Forms for election details (`datetime-local` converted to unix seconds) and candidates, with client-side validation *and* contract validation.
- Start and End buttons with confirmation dialogs and a list of reasons when an action is not yet possible.

### Results (`pages/Results.jsx` + `components/ResultsChart.jsx`)

- Horizontal bar chart (ranking) and donut chart (vote share) using Recharts.
- Each candidate's colour is tied to its ID, so it stays the same everywhere; the palette was checked for colour-blind separation in both themes, and every chart also has text labels and a legend.
- Winner verified with the contract's `getWinner()` once results are final.

## 8.5 Key screens

| Screen | Highlights |
|---|---|
| Landing | Title, subtitle, Connect Wallet / View Election, 4 feature cards, live snapshot |
| Election dashboard | Status badge, countdown, start and end, candidates, votes, voter status, activity feed |
| Candidates | Cards with avatar, ID, description, votes, % bar, Vote button, Already Voted state |
| Voting modal | Confirmation, MetaMask prompt, pending, success with tx hash, block, gas and fee |
| Results | Totals, winner spotlight, charts, ranking table |
| Admin | Phase stepper, election form, start and end, candidate form and table, transaction status |
