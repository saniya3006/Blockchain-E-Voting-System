import { useEffect, useState } from "react";
import { BarChart3, Crown, Hash, Medal, Radio, Trophy, Users, Vote } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { areResultsFinal, deriveStatus, getReadContract } from "../utils/blockchain";
import { useNow } from "../utils/useNow";
import ResultsChart from "../components/ResultsChart";
import { Avatar, EmptyState, PageHeader, Pill, StatCard, StatusBadge, candidateColor } from "../components/ui";

/** Winner as reported by the smart contract's getWinner() (only callable once results are final). */
function useOnChainWinner(final, totalVotes) {
  const [winner, setWinner] = useState(null);
  useEffect(() => {
    if (!final) {
      setWinner(null);
      return;
    }
    getReadContract()
      .getWinner()
      .then((w) => setWinner({ id: Number(w.winnerId), name: w.name, voteCount: Number(w.voteCount), isTie: w.isTie }))
      .catch(() => setWinner(null));
  }, [final, totalVotes]);
  return winner;
}

export default function Results() {
  const { election, candidates, contractStatus } = useWeb3();
  const now = useNow();
  const status = deriveStatus(election, now);
  const final = areResultsFinal(election, now);
  const totalVotes = election?.totalVotes ?? 0;
  const onChainWinner = useOnChainWinner(final, totalVotes);

  const ranked = [...candidates].sort((a, b) => b.voteCount - a.voteCount || a.id - b.id);
  const topVotes = ranked[0]?.voteCount ?? 0;
  const leaders = ranked.filter((c) => c.voteCount === topVotes);
  const isTie = totalVotes > 0 && leaders.length > 1;
  const leader = onChainWinner ? candidates.find((c) => c.id === onChainWinner.id) ?? ranked[0] : ranked[0];
  const pct = (votes) => (totalVotes > 0 ? (votes / totalVotes) * 100 : 0);

  if (contractStatus !== "loading" && candidates.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Results" title="Election Results" />
        <EmptyState icon={BarChart3} title="No results yet" description="Results appear once candidates are registered and votes are cast." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Results"
        title="Election Results"
        description={
          final
            ? "Voting has closed. These results are final and permanently recorded on the blockchain."
            : "Live tally read directly from the smart contract. Results become final when the election ends."
        }
        actions={
          final ? (
            <Pill tone="rose" icon={Medal}>
              Final results
            </Pill>
          ) : (
            <Pill tone="emerald" icon={Radio}>
              Live tally
            </Pill>
          )
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Vote} label="Total votes" value={totalVotes.toLocaleString()} accent="from-indigo-500 to-violet-500" />
        <StatCard icon={Users} label="Candidates" value={candidates.length} accent="from-cyan-500 to-sky-500" />
        <StatCard
          icon={Trophy}
          label={final ? "Winner" : "Current leader"}
          value={totalVotes === 0 ? "-" : isTie ? "Tie" : leader?.name}
          hint={totalVotes === 0 ? "No votes yet" : `${topVotes} votes · ${pct(topVotes).toFixed(1)}%`}
          accent="from-amber-500 to-orange-500"
        />
        <div className="glass card-hover p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Election status</p>
          <StatusBadge status={status} className="mt-3" />
          <p className="mt-2 truncate text-xs text-faint">{election?.title}</p>
        </div>
      </div>

      {/* Winner spotlight */}
      {totalVotes > 0 && leader && (
        <div className="glass relative mt-6 overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/25 blur-3xl" />
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="relative">
              <Avatar id={leader.id} name={leader.name} size="lg" />
              <Crown className="absolute -right-3 -top-4 h-8 w-8 rotate-12 text-amber-400 drop-shadow" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {final ? (isTie ? "🤝 Result: Tie" : "🏆 Winner") : "📈 Currently leading (provisional)"}
              </p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight">
                {isTie ? leaders.map((c) => c.name).join(" & ") : leader.name}
              </h2>
              <p className="mt-1 text-muted">
                <span className="text-2xl font-bold text-[color:var(--text)]">{topVotes.toLocaleString()}</span> votes ·{" "}
                {pct(topVotes).toFixed(1)}% of all votes
              </p>
              {final && onChainWinner && (
                <p className="mt-2 text-xs text-faint">
                  Verified by the smart contract&apos;s <code className="mono">getWinner()</code> function
                  {onChainWinner.isTie ? " (tie reported - lowest candidate ID listed first)" : ""}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <ResultsChart candidates={candidates} totalVotes={totalVotes} />
      </div>

      {/* Ranking table (also the accessible / text alternative to the charts) */}
      <div className="glass mt-6 overflow-hidden">
        <div className="p-5">
          <h3 className="section-title">Candidate ranking</h3>
          <p className="text-xs text-faint">Sorted by votes received</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-y border-[color:var(--glass-border)] bg-indigo-500/5 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">
                  <Hash className="inline h-3.5 w-3.5" /> ID
                </th>
                <th className="px-5 py-3 text-right">Votes</th>
                <th className="px-5 py-3">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((c) => {
                const rank = ranked.findIndex((x) => x.voteCount === c.voteCount) + 1; // equal votes share a rank
                return (
                  <tr key={c.id} className="border-b border-[color:var(--glass-border)] last:border-0 hover:bg-indigo-500/5">
                    <td className="px-5 py-3 font-bold tabular-nums">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                          totalVotes === 0
                            ? "bg-slate-500/15"
                            : rank === 1
                            ? "bg-amber-400/25 text-amber-700 ring-1 ring-amber-400/60 dark:text-amber-300"
                            : rank === 2
                            ? "bg-slate-400/25 text-slate-600 ring-1 ring-slate-400/60 dark:text-slate-300"
                            : rank === 3
                            ? "bg-orange-700/20 text-orange-800 ring-1 ring-orange-700/40 dark:text-orange-300"
                            : "bg-slate-500/10 text-muted"
                        }`}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar id={c.id} name={c.name} size="sm" />
                        <span className="font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="mono px-5 py-3 text-faint">{c.id}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{c.voteCount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-500/15">
                          <div className="h-full rounded-full" style={{ width: `${pct(c.voteCount)}%`, background: candidateColor(c.id) }} />
                        </div>
                        <span className="tabular-nums text-muted">{pct(c.voteCount).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
