import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Lock, PlayCircle, Save, Settings2, ShieldAlert, ShieldCheck, StopCircle, UserPlus, Users, Vote, Wallet } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { PHASE, deriveStatus, formatDateTime, toDateTimeLocal, toUnixSeconds } from "../utils/blockchain";
import { useNow } from "../utils/useNow";
import ConfirmDialog from "../components/ConfirmDialog";
import TransactionList from "../components/TransactionList";
import { AddressLabel, Avatar, EmptyState, PageHeader, SkeletonCard, Spinner, StatCard, StatusBadge } from "../components/ui";

const PHASES = [
  { key: PHASE.SETUP, label: "Setup", hint: "Configure & add candidates" },
  { key: PHASE.ACTIVE, label: "Active", hint: "Voting window" },
  { key: PHASE.ENDED, label: "Ended", hint: "Results final" },
];

function PhaseStepper({ phase }) {
  return (
    <ol className="grid grid-cols-3 gap-2">
      {PHASES.map((p) => {
        const done = phase > p.key;
        const current = phase === p.key;
        return (
          <li
            key={p.key}
            className={`rounded-xl border p-3 text-center text-xs transition ${
              current
                ? "border-indigo-500/50 bg-indigo-500/15"
                : done
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-[color:var(--glass-border)] opacity-60"
            }`}
          >
            <p className="flex items-center justify-center gap-1 font-semibold">
              {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              {p.label}
            </p>
            <p className="mt-0.5 text-faint">{p.hint}</p>
          </li>
        );
      })}
    </ol>
  );
}

/** Shown to connected wallets that are not the contract owner. */
function AccessRestricted() {
  const { election, sendTransaction } = useWeb3();
  const attemptAdminAction = () => sendTransaction("Unauthorised admin attempt (endElection)", (contract) => contract.endElection());

  return (
    <div className="glass mx-auto max-w-2xl p-8 text-center">
      <div className="mx-auto inline-flex rounded-2xl bg-rose-500/10 p-4 text-rose-500">
        <Lock className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-bold">Administrator access only</h2>
      <p className="mt-2 text-muted">
        Your wallet is not the owner of this smart contract. Admin functions are protected by the <code className="mono">onlyOwner</code>{" "}
        modifier in Solidity.
      </p>
      <p className="mt-3 inline-flex items-center gap-1 text-sm text-faint">
        Administrator: <AddressLabel address={election?.admin} />
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-[color:var(--glass-border)] p-4 text-left text-sm">
        <p className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="h-4 w-4 text-amber-500" /> Demonstrate access control
        </p>
        <p className="mt-1 text-muted">
          Hiding buttons in the UI is not security. Send an admin transaction anyway - the smart contract itself will reject it with{" "}
          <code className="mono">NotOwner()</code>.
        </p>
        <button onClick={attemptAdminAction} className="btn-secondary mt-3">
          <StopCircle className="h-4 w-4" /> Try to end the election
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { account, connectWallet, isOwner, election, candidates, sendTransaction, contractStatus } = useWeb3();
  const now = useNow();
  const status = deriveStatus(election, now);
  const phase = election?.phase ?? PHASE.SETUP;
  const inSetup = phase === PHASE.SETUP;

  // ---- election form ----
  const [form, setForm] = useState({ title: "", description: "", start: "", end: "" });
  const [formDirty, setFormDirty] = useState(false);
  const [busy, setBusy] = useState(null); // which action is running
  const [confirm, setConfirm] = useState(null); // "start" | "end"

  // pre-fill the form with on-chain values (or sensible defaults)
  useEffect(() => {
    if (formDirty || !election) return;
    const nowSec = Math.floor(Date.now() / 1000);
    setForm({
      title: election.title || "",
      description: election.description || "",
      start: toDateTimeLocal(election.startTime || nowSec),
      end: toDateTimeLocal(election.endTime || nowSec + 24 * 60 * 60),
    });
  }, [election, formDirty]);

  const updateForm = (field) => (e) => {
    setFormDirty(true);
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  // ---- candidate form ----
  const [candidateForm, setCandidateForm] = useState({ name: "", description: "" });

  const run = async (key, label, action) => {
    setBusy(key);
    const result = await sendTransaction(label, action);
    setBusy(null);
    return result;
  };

  const saveElection = async (e) => {
    e.preventDefault();
    const start = toUnixSeconds(form.start);
    const end = toUnixSeconds(form.end);
    if (!form.title.trim()) return toast.error("Election title is required.");
    if (Number.isNaN(start) || Number.isNaN(end)) return toast.error("Please choose valid start and end dates.");
    if (end <= start) return toast.error("End time must be after the start time.");
    if (end <= Math.floor(Date.now() / 1000)) return toast.error("End time must be in the future.");

    const result = await run("config", "Save election details", (contract) =>
      contract.configureElection(form.title.trim(), form.description.trim(), start, end)
    );
    if (result) setFormDirty(false);
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    const name = candidateForm.name.trim();
    if (!name) return toast.error("Candidate name is required.");
    if (candidates.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return toast.error("A candidate with this name already exists.");
    }
    const result = await run("candidate", `Add candidate "${name}"`, (contract) => contract.addCandidate(name, candidateForm.description.trim()));
    if (result) setCandidateForm({ name: "", description: "" });
  };

  const startElection = async () => {
    setConfirm(null);
    await run("start", "Start election", (contract) => contract.startElection());
  };

  const endElection = async () => {
    setConfirm(null);
    await run("end", "End election", (contract) => contract.endElection());
  };

  // ---- guards ----
  if (!account) {
    return (
      <div>
        <PageHeader eyebrow="Administration" title="Admin Dashboard" />
        <EmptyState
          icon={Wallet}
          title="Connect the administrator wallet"
          description="Only the wallet that deployed the smart contract (the owner) can manage the election."
          action={
            <button onClick={connectWallet} className="btn-primary">
              <Wallet className="h-4 w-4" /> Connect Wallet
            </button>
          }
        />
      </div>
    );
  }

  if (contractStatus !== "ready" || !election) {
    return (
      <div>
        <PageHeader eyebrow="Administration" title="Admin Dashboard" />
        {contractStatus === "loading" ? (
          <SkeletonCard className="h-72" />
        ) : (
          <EmptyState icon={ShieldAlert} title="Smart contract unavailable" description="Deploy the contract and make sure the blockchain is running (see the notice above)." />
        )}
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div>
        <PageHeader eyebrow="Administration" title="Admin Dashboard" />
        <AccessRestricted />
      </div>
    );
  }

  const startBlockers = [];
  if (!election?.title) startBlockers.push("Save the election details first");
  if (candidates.length < 2) startBlockers.push("Add at least two candidates");
  if (election?.endTime && election.endTime <= now) startBlockers.push("End time has passed - update the election dates");

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Admin Dashboard"
        description="Manage the election life-cycle. Every action below is a signed blockchain transaction."
        actions={
          <span className="chip bg-amber-500/10 text-amber-700 dark:text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Signed in as contract owner
          </span>
        }
      />

      {/* ---- statistics ---- */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total candidates" value={candidates.length} accent="from-cyan-500 to-sky-500" />
        <StatCard icon={Vote} label="Total votes" value={election?.totalVotes ?? 0} accent="from-indigo-500 to-violet-500" />
        <div className="glass card-hover p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Current status</p>
          <StatusBadge status={status} className="mt-3" />
          <p className="mt-2 text-xs text-faint">Ends {formatDateTime(election?.endTime)}</p>
        </div>
        <div className="glass card-hover p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Contract owner</p>
          <div className="mt-3 text-sm">
            <AddressLabel address={election?.admin} />
          </div>
          <p className="mt-2 text-xs text-faint">Deployer of Voting.sol</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* ---- election management ---- */}
        <section className="glass p-6 lg:col-span-3">
          <h2 className="section-title flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-indigo-500" /> Election Management
          </h2>
          <div className="mt-4">
            <PhaseStepper phase={phase} />
          </div>

          <form onSubmit={saveElection} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="title">
                Election name
              </label>
              <input id="title" className="input" value={form.title} onChange={updateForm("title")} disabled={!inSetup} maxLength={100} placeholder="e.g. Student Council Election 2026" />
            </div>
            <div>
              <label className="label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="input resize-none"
                value={form.description}
                onChange={updateForm("description")}
                disabled={!inSetup}
                maxLength={300}
                placeholder="What is this election about?"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="start">
                  Start date & time
                </label>
                <input id="start" type="datetime-local" className="input" value={form.start} onChange={updateForm("start")} disabled={!inSetup} />
              </div>
              <div>
                <label className="label" htmlFor="end">
                  End date & time
                </label>
                <input id="end" type="datetime-local" className="input" value={form.end} onChange={updateForm("end")} disabled={!inSetup} />
              </div>
            </div>
            {inSetup ? (
              <button type="submit" className="btn-secondary" disabled={busy !== null}>
                {busy === "config" ? <Spinner /> : <Save className="h-4 w-4" />} Save Election Details
              </button>
            ) : (
              <p className="flex items-center gap-2 text-xs text-faint">
                <Lock className="h-3.5 w-3.5" /> Election details are locked on-chain once the election has started.
              </p>
            )}
          </form>

          <div className="mt-6 border-t border-[color:var(--glass-border)] pt-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setConfirm("start")}
                className="btn-success"
                disabled={!inSetup || startBlockers.length > 0 || busy !== null || formDirty}
              >
                {busy === "start" ? <Spinner /> : <PlayCircle className="h-4 w-4" />} Start Election
              </button>
              <button onClick={() => setConfirm("end")} className="btn-danger" disabled={phase !== PHASE.ACTIVE || busy !== null}>
                {busy === "end" ? <Spinner /> : <StopCircle className="h-4 w-4" />} End Election
              </button>
            </div>
            {inSetup && (startBlockers.length > 0 || formDirty) && (
              <ul className="mt-3 space-y-1 text-xs text-amber-600 dark:text-amber-400">
                {formDirty && <li>• You have unsaved changes - save the election details first</li>}
                {startBlockers.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
            )}
            {phase === PHASE.ENDED && <p className="mt-3 text-xs text-faint">The election has ended. Deploy a new contract to run another election.</p>}
          </div>
        </section>

        {/* ---- candidate management ---- */}
        <section className="glass p-6 lg:col-span-2">
          <h2 className="section-title flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-500" /> Candidate Management
          </h2>
          <form onSubmit={addCandidate} className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="cname">
                Candidate name
              </label>
              <input
                id="cname"
                className="input"
                value={candidateForm.name}
                onChange={(e) => setCandidateForm((f) => ({ ...f, name: e.target.value }))}
                disabled={!inSetup}
                maxLength={60}
                placeholder="e.g. Rahul Sharma"
              />
            </div>
            <div>
              <label className="label" htmlFor="cdesc">
                Candidate description
              </label>
              <input
                id="cdesc"
                className="input"
                value={candidateForm.description}
                onChange={(e) => setCandidateForm((f) => ({ ...f, description: e.target.value }))}
                disabled={!inSetup}
                maxLength={160}
                placeholder="e.g. Candidate for Student Council President"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={!inSetup || busy !== null}>
              {busy === "candidate" ? <Spinner /> : <UserPlus className="h-4 w-4" />} Add Candidate
            </button>
            {!inSetup && (
              <p className="flex items-center gap-2 text-xs text-faint">
                <Lock className="h-3.5 w-3.5" /> The smart contract does not allow new candidates after the election starts.
              </p>
            )}
          </form>

          <div className="mt-6 overflow-x-auto rounded-xl border border-[color:var(--glass-border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-indigo-500/5 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2 text-right">Votes</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-faint">
                      No candidates yet
                    </td>
                  </tr>
                ) : (
                  candidates.map((c) => (
                    <tr key={c.id} className="border-t border-[color:var(--glass-border)]">
                      <td className="mono px-3 py-2 text-faint">{c.id}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Avatar id={c.id} name={c.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{c.name}</p>
                            <p className="truncate text-xs text-faint">{c.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">{c.voteCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-6">
        <TransactionList title="Blockchain transaction status" />
      </div>

      <ConfirmDialog
        open={confirm === "start"}
        title="Start the election?"
        message={
          <>
            Voting will be open from <b>{formatDateTime(election?.startTime)}</b> to <b>{formatDateTime(election?.endTime)}</b>. After starting,
            candidates and election details can no longer be changed.
          </>
        }
        confirmLabel="Start Election"
        tone="success"
        onConfirm={startElection}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "end"}
        title="End the election now?"
        message="No more votes will be accepted and the results become final. This cannot be undone."
        confirmLabel="End Election"
        tone="danger"
        onConfirm={endElection}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
