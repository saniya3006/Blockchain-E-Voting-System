import { CheckCircle2, Lock, Vote } from "lucide-react";
import { Avatar, candidateColor } from "./ui";

/**
 * A single candidate on the ballot.
 * `voteState`: "can-vote" | "voted" | "closed" | "connect" | "wrong-network"
 */
export default function CandidateCard({ candidate, totalVotes, voteState, isMyChoice, onVote, onConnect, disabledReason }) {
  const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
  const color = candidateColor(candidate.id);

  return (
    <article
      className={`glass card-hover group relative flex flex-col overflow-hidden p-6 ${isMyChoice ? "ring-2 ring-emerald-500/60" : ""}`}
      aria-label={`Candidate ${candidate.name}`}
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />

      <div className="flex items-start justify-between gap-3">
        <Avatar id={candidate.id} name={candidate.name} />
        <span className="chip mono text-faint">Candidate {String(candidate.id + 1).padStart(2, "0")}</span>
      </div>

      <h3 className="mt-4 text-xl font-bold tracking-tight">{candidate.name}</h3>
      <p className="mt-1 text-xs text-faint">On-chain ID: {candidate.id}</p>
      <p className="mt-3 flex-1 text-sm text-muted">"{candidate.description || "No description provided."}"</p>

      <div className="mt-5">
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-semibold">
            {candidate.voteCount} vote{candidate.voteCount === 1 ? "" : "s"}
          </span>
          <span className="text-muted tabular-nums">{percentage.toFixed(1)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-500/15">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, background: color }} />
        </div>
      </div>

      <div className="mt-5">
        {isMyChoice && (
          <p className="mb-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Your vote
          </p>
        )}
        {voteState === "can-vote" && (
          <button onClick={() => onVote(candidate)} className="btn-primary w-full">
            <Vote className="h-4 w-4" /> Vote
          </button>
        )}
        {voteState === "connect" && (
          <button onClick={onConnect} className="btn-secondary w-full">
            Connect wallet to vote
          </button>
        )}
        {(voteState === "voted" || voteState === "closed" || voteState === "wrong-network") && (
          <button disabled className="btn-secondary w-full" title={disabledReason}>
            <Lock className="h-4 w-4" /> {disabledReason}
          </button>
        )}
      </div>
    </article>
  );
}
