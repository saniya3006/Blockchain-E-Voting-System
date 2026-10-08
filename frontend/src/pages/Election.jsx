import { Link } from "react-router-dom";
import { ArrowRight, FileCode2, RefreshCw } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CHAIN_ID, NETWORK, RPC_URL } from "../utils/blockchain";
import ElectionStats from "../components/ElectionStats";
import VoterStatus from "../components/VoterStatus";
import ActivityFeed from "../components/ActivityFeed";
import { AddressLabel, Avatar, PageHeader, SkeletonCard } from "../components/ui";

function ContractInfo() {
  const { contractAddress, election, lastUpdated, refresh } = useWeb3();
  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between">
        <h3 className="section-title flex items-center gap-2">
          <FileCode2 className="h-5 w-5 text-indigo-500" /> Smart contract
        </h3>
        <button onClick={refresh} className="rounded-lg p-1.5 text-faint hover:bg-indigo-500/10 hover:text-indigo-500" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">Contract</dt>
          <dd>
            <AddressLabel address={contractAddress} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">Administrator</dt>
          <dd>
            <AddressLabel address={election?.admin} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">Network</dt>
          <dd className="font-medium">
            {NETWORK.name} <span className="text-faint">({CHAIN_ID})</span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">RPC</dt>
          <dd className="mono truncate text-faint">{RPC_URL || "MetaMask"}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted">Last synced</dt>
          <dd className="text-faint">{lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function Election() {
  const { election, candidates, contractStatus } = useWeb3();

  return (
    <div>
      <PageHeader
        eyebrow="Election dashboard"
        title="Current Election"
        description="All information on this page is read directly from the smart contract on the blockchain."
        actions={
          <Link to="/candidates" className="btn-primary">
            View Candidates <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {contractStatus === "loading" && !election ? (
        <SkeletonCard className="h-72" />
      ) : (
        <ElectionStats election={election} />
      )}

      {candidates.length > 0 && (
        <div className="glass mt-6 p-5">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Candidates on the ballot</h3>
            <Link to="/candidates" className="text-sm font-medium text-indigo-500 hover:underline">
              Open ballot →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {candidates.map((c) => (
              <Link
                key={c.id}
                to="/candidates"
                className="flex items-center gap-3 rounded-xl border border-[color:var(--glass-border)] p-3 transition hover:bg-indigo-500/5"
              >
                <Avatar id={c.id} name={c.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{c.name}</p>
                  <p className="text-xs text-faint">ID {c.id}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <VoterStatus />
          <ContractInfo />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
