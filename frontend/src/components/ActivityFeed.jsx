import { Activity, Flag, PlayCircle, Settings2, StopCircle, UserPlus, Vote } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { formatDateTime, shortenAddress } from "../utils/blockchain";
import { EmptyState, TxHash } from "./ui";

const EVENT_META = {
  VoteCast: { icon: Vote, color: "text-indigo-500 bg-indigo-500/10", title: "Vote cast" },
  CandidateAdded: { icon: UserPlus, color: "text-cyan-500 bg-cyan-500/10", title: "Candidate added" },
  ElectionConfigured: { icon: Settings2, color: "text-violet-500 bg-violet-500/10", title: "Election configured" },
  ElectionStarted: { icon: PlayCircle, color: "text-emerald-500 bg-emerald-500/10", title: "Election started" },
  ElectionEnded: { icon: StopCircle, color: "text-rose-500 bg-rose-500/10", title: "Election ended" },
};

function describe(event, candidates) {
  const nameOf = (id) => candidates.find((c) => c.id === Number(id))?.name ?? `#${id}`;
  switch (event.name) {
    case "VoteCast":
      return (
        <>
          <span className="mono">{shortenAddress(event.args[0])}</span> voted for <b>{nameOf(event.args[1])}</b>
        </>
      );
    case "CandidateAdded":
      return (
        <>
          <b>{event.args[1]}</b> registered with ID {event.args[0]}
        </>
      );
    case "ElectionConfigured":
      return <>“{event.args[0]}”</>;
    case "ElectionStarted":
      return <>Voting window: {formatDateTime(event.args[0])} → {formatDateTime(event.args[1])}</>;
    case "ElectionEnded":
      return <>Closed with {event.args[1]} total votes</>;
    default:
      return event.name;
  }
}

/**
 * Public audit trail built from smart-contract events (logs).
 * Anyone can rebuild this list from the blockchain - no database involved.
 */
export default function ActivityFeed({ limit = 12 }) {
  const { activity, candidates } = useWeb3();
  const items = activity.slice(0, limit);

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" /> Blockchain activity
          </h3>
          <p className="text-xs text-faint">Live feed of smart contract events</p>
        </div>
        <span className="chip text-faint">
          <Flag className="h-3 w-3" /> {activity.length} events
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No events yet" description="Events appear here as soon as transactions are mined." />
      ) : (
        <ol className="relative space-y-3">
          {items.map((event) => {
            const meta = EVENT_META[event.name] ?? { icon: Activity, color: "text-slate-500 bg-slate-500/10", title: event.name };
            const Icon = meta.icon;
            return (
              <li key={event.id} className="flex gap-3 rounded-xl border border-[color:var(--glass-border)] p-3 transition hover:bg-indigo-500/5">
                <div className={`h-fit rounded-lg p-2 ${meta.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-sm font-semibold">{meta.title}</p>
                    <p className="text-[11px] text-faint">
                      Block #{event.blockNumber}
                      {event.timestamp ? ` · ${formatDateTime(event.timestamp)}` : ""}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">{describe(event, candidates)}</p>
                  <div className="mt-1 text-[11px] text-faint">
                    tx <TxHash hash={event.txHash} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
