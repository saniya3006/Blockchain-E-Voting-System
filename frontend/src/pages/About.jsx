import { ArrowDown, Blocks, Code2, Eye, FileCode2, Fingerprint, Layers, Lock, Monitor, Network, ShieldAlert, Wallet, Zap } from "lucide-react";
import { PageHeader } from "../components/ui";

const LAYERS = [
  { icon: Monitor, title: "User", text: "Voter / Administrator" },
  { icon: Layers, title: "React Frontend (Vite)", text: "Pages, forms, charts - no business rules" },
  { icon: Code2, title: "ethers.js", text: "Encodes calls, reads data, sends transactions" },
  { icon: Wallet, title: "MetaMask", text: "Holds private key, signs transactions" },
  { icon: FileCode2, title: "Solidity Smart Contract", text: "Election logic · voting logic · candidates · voter status" },
  { icon: Blocks, title: "Ethereum-compatible Blockchain", text: "Hardhat local network or Sepolia testnet" },
];

const CONCEPTS = [
  { icon: Network, title: "Decentralization", text: "No central server owns the data - every node of the network keeps a copy of the contract state." },
  { icon: Lock, title: "Immutability", text: "Confirmed transactions are linked by cryptographic hashes; changing an old vote would break every later block." },
  { icon: Eye, title: "Transparency", text: "Vote counts and VoteCast events are public. Anyone can recount the result from the chain." },
  { icon: Fingerprint, title: "Wallet identity", text: "msg.sender is the address that signed the transaction. It is used to enforce one vote per wallet." },
  { icon: Zap, title: "Gas fees", text: "Each state-changing transaction costs gas (paid in test ETH here) to pay validators for computation." },
  { icon: FileCode2, title: "Smart contract automation", text: "Rules such as voting window, candidate validation and access control run automatically on-chain." },
];

const STACK = [
  ["Smart contract", "Solidity 0.8.24"],
  ["Blockchain dev environment", "Hardhat (local node, tests, deployment)"],
  ["Network", "Hardhat localhost (31337) / Sepolia testnet"],
  ["Web3 library", "ethers.js v6"],
  ["Wallet", "MetaMask"],
  ["Frontend", "React 18 + Vite 5"],
  ["Styling", "Tailwind CSS 3"],
  ["Charts & icons", "Recharts · Lucide React"],
  ["Testing", "Mocha + Chai (Hardhat Toolbox)"],
];

export default function About() {
  return (
    <div>
      <PageHeader
        eyebrow="About the project"
        title="Decentralized E-Voting System"
        description="A B.Tech mini project demonstrating how blockchain, smart contracts and dApps can make an election transparent, tamper-resistant and auditable."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass p-6">
          <h2 className="section-title">System architecture</h2>
          <p className="mt-1 text-sm text-muted">The smart contract is the single source of truth. There is no backend server or database.</p>
          <div className="mt-6 flex flex-col items-center">
            {LAYERS.map((layer, i) => (
              <div key={layer.title} className="flex w-full flex-col items-center">
                <div
                  className={`flex w-full max-w-md items-center gap-4 rounded-xl border p-3.5 ${
                    i === 4 ? "border-indigo-500/50 bg-indigo-500/10 shadow-glow" : "border-[color:var(--glass-border)] bg-[color:var(--glass)]"
                  }`}
                >
                  <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 p-2 text-white">
                    <layer.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{layer.title}</p>
                    <p className="text-xs text-muted">{layer.text}</p>
                  </div>
                </div>
                {i < LAYERS.length - 1 && <ArrowDown className="my-1 h-4 w-4 text-faint" />}
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="glass p-6">
            <h2 className="section-title">Technology stack</h2>
            <dl className="mt-4 divide-y divide-[color:var(--glass-border)] text-sm">
              {STACK.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="glass p-6">
            <h2 className="section-title">Smart contract rules (Voting.sol)</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              <li>• Only the <code className="mono">owner</code> (deployer) can configure, add candidates, start and end.</li>
              <li>• Candidates can only be added before the election starts.</li>
              <li>• Votes are accepted only while the election is active and inside the start/end time.</li>
              <li>• <code className="mono">hasVoted[msg.sender]</code> blocks a second vote from the same wallet.</li>
              <li>• Candidate IDs are validated; invalid IDs revert.</li>
              <li>• Every action emits an event for a public audit trail.</li>
            </ul>
          </section>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="section-title mb-4">Blockchain concepts demonstrated</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c) => (
            <div key={c.title} className="glass card-hover p-5">
              <c.icon className="h-6 w-6 text-indigo-500" />
              <h3 className="mt-3 font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-900 dark:text-amber-100">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ShieldAlert className="h-5 w-5" /> Limitations & disclaimer
        </h2>
        <p className="mt-2 text-sm font-medium">This project is an educational prototype and is not intended for use in real public elections.</p>
        <ul className="mt-3 space-y-1.5 text-sm opacity-90">
          <li>• Blockchain does not prove that a real-world person is an eligible voter. One person could create many wallets.</li>
          <li>• Wallet addresses are pseudonymous, not anonymous. Because transactions on a public blockchain can be inspected, this prototype is not a privacy-preserving (secret ballot) system.</li>
          <li>• Live vote counts are visible to everyone during the election.</li>
          <li>• Voters need a wallet and test ETH for gas - not accessible for everyone.</li>
          <li>• A real system would need identity verification, privacy-preserving cryptography (e.g. zero-knowledge proofs, commit-reveal, homomorphic encryption), independent audits and accessibility support.</li>
          <li>• Never store personal data (names, Aadhaar, phone numbers, passwords) on-chain - all blockchain data is public forever.</li>
        </ul>
      </section>
    </div>
  );
}
