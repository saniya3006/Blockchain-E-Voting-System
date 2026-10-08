import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Blocks, CheckCircle2, FileCheck2, Link2, Lock, MousePointerClick, ShieldCheck, Vote, Wallet } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { deriveStatus, NETWORK, shortenAddress } from "../utils/blockchain";
import { useNow } from "../utils/useNow";
import { Spinner, StatusBadge } from "../components/ui";

const FEATURES = [
  {
    emoji: "🔐",
    icon: Lock,
    title: "Secure",
    text: "Rules are enforced by a Solidity smart contract. Only the admin can manage the election - every other attempt is rejected on-chain.",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    emoji: "⛓",
    icon: Blocks,
    title: "Blockchain Powered",
    text: "Every vote is a signed transaction recorded in a block. Once confirmed, it cannot be edited or deleted.",
    accent: "from-cyan-500 to-sky-500",
  },
  {
    emoji: "📊",
    icon: BarChart3,
    title: "Transparent",
    text: "Vote counts and the full event log are public. Anyone can audit the result directly from the blockchain.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    emoji: "🗳",
    icon: Vote,
    title: "One Wallet, One Vote",
    text: "The contract stores hasVoted[address] and rejects a second vote from the same wallet automatically.",
    accent: "from-amber-500 to-orange-500",
  },
];

const STEPS = [
  { icon: Wallet, title: "Connect wallet", text: "Sign in with MetaMask - your wallet address is your identity." },
  { icon: MousePointerClick, title: "Choose a candidate", text: "Browse the candidates registered on the smart contract." },
  { icon: FileCheck2, title: "Sign the transaction", text: "Approve the vote in MetaMask and pay a tiny test-ETH gas fee." },
  { icon: Link2, title: "Recorded on-chain", text: "Miners/validators include it in a block - permanent and auditable." },
];

export default function Home() {
  const { account, connectWallet, connecting, election, contractStatus, hasVoted, candidates } = useWeb3();
  const now = useNow();
  const status = deriveStatus(election, now);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-x-clip pb-16 pt-10 sm:pt-16">
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="chip bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
              <Blocks className="h-3.5 w-3.5" /> Ethereum · Solidity · {NETWORK.shortName}
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Decentralized <span className="text-gradient whitespace-nowrap">E-Voting</span>
            </h1>
            <p className="mt-4 text-xl font-medium text-muted sm:text-2xl">Transparent. Tamper-Resistant. Blockchain Powered.</p>
            <p className="mt-4 max-w-xl text-muted">
              A decentralized application (dApp) where elections, candidates and votes are managed by a smart contract instead of a central
              server. Every vote is a blockchain transaction that anyone can verify.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {account ? (
                <span className="btn-secondary cursor-default">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Connected: <span className="mono">{shortenAddress(account)}</span>
                </span>
              ) : (
                <button onClick={connectWallet} disabled={connecting} className="btn-primary px-6 py-3 text-base">
                  {connecting ? <Spinner /> : <Wallet className="h-5 w-5" />} Connect Wallet
                </button>
              )}
              <Link to="/election" className="btn-secondary px-6 py-3 text-base">
                View Election <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Election snapshot */}
          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-cyan-400/30 blur-2xl" />
            <div className="glass animate-float p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Live from the blockchain</p>
                {contractStatus === "ready" && <StatusBadge status={status} />}
              </div>
              {contractStatus === "ready" && election ? (
                <>
                  <h2 className="mt-4 text-2xl font-bold">{election.title || "Election not configured yet"}</h2>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-indigo-500/10 p-4">
                      <p className="text-3xl font-bold">{election.candidateCount}</p>
                      <p className="text-xs text-muted">Candidates</p>
                    </div>
                    <div className="rounded-2xl bg-cyan-500/10 p-4">
                      <p className="text-3xl font-bold">{election.totalVotes}</p>
                      <p className="text-xs text-muted">Votes cast</p>
                    </div>
                  </div>
                  <div className="mt-5 flex -space-x-2">
                    {candidates.slice(0, 6).map((c) => (
                      <div
                        key={c.id}
                        title={c.name}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[color:var(--bg)] text-xs font-bold text-white"
                        style={{ background: `var(--chart-${(c.id % 8) + 1})` }}
                      >
                        {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </div>
                    ))}
                  </div>
                  {account && (
                    <p className={`mt-5 text-sm font-medium ${hasVoted ? "text-emerald-500" : "text-muted"}`}>
                      {hasVoted ? "✓ Your wallet has already voted." : "Your wallet has not voted yet."}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-muted">
                  {contractStatus === "loading" ? "Reading election data..." : "Election data unavailable - see the notice above."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass card-hover animate-fade-up p-6" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${f.accent} p-3 text-white shadow-lg`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                <span className="mr-1.5" aria-hidden="true">
                  {f.emoji}
                </span>
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="py-10">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">From click to block in four steps</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="glass relative p-6">
              <span className="absolute right-5 top-4 text-5xl font-black text-indigo-500/10">{i + 1}</span>
              <s.icon className="h-7 w-7 text-indigo-500" />
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="py-10">
        <div className="glass relative overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <ShieldCheck className="h-7 w-7 text-emerald-500" /> Ready to cast your vote?
              </h2>
              <p className="mt-2 max-w-xl text-muted">View the candidates, cast one vote with your wallet and watch the results update live from the blockchain.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/candidates" className="btn-primary">
                <Vote className="h-4 w-4" /> Go to ballot
              </Link>
              <Link to="/results" className="btn-secondary">
                <BarChart3 className="h-4 w-4" /> See results
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
