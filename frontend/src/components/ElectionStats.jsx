import { CalendarClock, CalendarX2, Hourglass, Users, Vote } from "lucide-react";
import { areResultsFinal, deriveStatus, formatDateTime } from "../utils/blockchain";
import { splitDuration, useNow } from "../utils/useNow";
import { StatusBadge } from "./ui";

function Countdown({ target, label }) {
  const now = useNow();
  const { days, hours, minutes, seconds } = splitDuration(target - now);
  const units = [
    ["Days", days],
    ["Hours", hours],
    ["Min", minutes],
    ["Sec", seconds],
  ];
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        <Hourglass className="h-3.5 w-3.5" /> {label}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map(([unit, value]) => (
          <div key={unit} className="rounded-xl border border-[color:var(--glass-border)] bg-indigo-500/5 px-2 py-2 text-center">
            <p className="text-xl font-bold tabular-nums sm:text-2xl">{String(value).padStart(2, "0")}</p>
            <p className="text-[10px] uppercase tracking-wider text-faint">{unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The main election dashboard card (title, status, timing and totals). */
export default function ElectionStats({ election }) {
  const now = useNow();
  const status = deriveStatus(election, now);
  const configured = Boolean(election?.title);

  return (
    <div className="glass relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-400/20 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <StatusBadge status={status} />
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{configured ? election.title : "Election not configured yet"}</h2>
          <p className="mt-2 text-muted">
            {configured ? election.description || "No description provided." : "The administrator has not set up the election details yet."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-[color:var(--glass-border)] p-3">
              <CalendarClock className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-xs text-faint">Starts</p>
                <p className="text-sm font-semibold">{formatDateTime(election?.startTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[color:var(--glass-border)] p-3">
              <CalendarX2 className="h-5 w-5 text-rose-500" />
              <div>
                <p className="text-xs text-faint">Ends</p>
                <p className="text-sm font-semibold">{formatDateTime(election?.endTime)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 p-4">
              <Users className="h-5 w-5 text-indigo-500" />
              <p className="mt-2 text-3xl font-bold">{election?.candidateCount ?? 0}</p>
              <p className="text-xs text-muted">Candidates</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500/15 to-emerald-500/10 p-4">
              <Vote className="h-5 w-5 text-cyan-500" />
              <p className="mt-2 text-3xl font-bold">{election?.totalVotes ?? 0}</p>
              <p className="text-xs text-muted">Votes cast</p>
            </div>
          </div>

          {status.key === "open" && <Countdown target={election.endTime} label="Voting closes in" />}
          {status.key === "scheduled" && <Countdown target={election.startTime} label="Voting opens in" />}
          {areResultsFinal(election, now) && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-200">
              Voting is closed. Results are final and permanently recorded on the blockchain.
            </p>
          )}
          {status.key === "setup" && (
            <p className="rounded-xl border border-[color:var(--glass-border)] bg-slate-500/10 p-3 text-sm text-muted">
              Waiting for the administrator to start the election.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
