import { Link } from "react-router-dom";
import { formatEther } from "ethers";
import { CheckCircle2, Loader2, ShieldAlert, Wallet, XCircle } from "lucide-react";
import Modal from "./Modal";
import { Avatar, TxHash } from "./ui";

/**
 * Walks the voter through the vote transaction:
 *   confirm -> awaiting-signature (MetaMask popup) -> pending (mining) -> confirmed | failed
 */
export default function VotingModal({ candidate, stage, data, onConfirm, onClose }) {
  const busy = stage === "awaiting-signature" || stage === "pending";

  return (
    <Modal open={Boolean(candidate)} onClose={onClose} locked={busy} labelledBy="vote-title">
      {candidate && (
        <div className="text-center">
          <div className="flex justify-center">
            <Avatar id={candidate.id} name={candidate.name} size="lg" />
          </div>

          {stage === "confirm" && (
            <>
              <h3 id="vote-title" className="mt-5 text-xl font-bold">
                Confirm your vote
              </h3>
              <p className="mt-2 text-muted">
                Are you sure you want to vote for <span className="font-semibold text-[color:var(--text)]">{candidate.name}</span>?
              </p>
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-800 dark:text-amber-200">
                <p className="flex items-center gap-1.5 font-semibold">
                  <ShieldAlert className="h-4 w-4" /> Your vote is final
                </p>
                <p className="mt-1">
                  The smart contract allows one vote per wallet and votes cannot be changed. The transaction (and your wallet address) will be
                  publicly visible on the blockchain.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={onConfirm} className="btn-primary">
                  Confirm Vote
                </button>
              </div>
            </>
          )}

          {stage === "awaiting-signature" && (
            <>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/15 text-orange-500">
                <Wallet className="h-7 w-7 animate-pulse" />
              </div>
              <h3 id="vote-title" className="mt-4 text-xl font-bold">
                Confirm this transaction in MetaMask
              </h3>
              <p className="mt-2 text-sm text-muted">
                Review the gas fee in the MetaMask popup and click <b>Confirm</b>. If no popup appears, click the MetaMask icon in your browser.
              </p>
            </>
          )}

          {stage === "pending" && (
            <>
              <Loader2 className="mx-auto mt-6 h-12 w-12 animate-spin text-indigo-500" />
              <h3 id="vote-title" className="mt-4 text-xl font-bold">
                Recording your vote on the blockchain...
              </h3>
              <p className="mt-2 text-sm text-muted">Transaction submitted. Waiting for it to be included in a block.</p>
              <div className="mt-4 rounded-xl bg-indigo-500/10 p-3 text-left text-xs">
                <p className="text-faint">Transaction hash</p>
                <TxHash hash={data?.hash} full />
              </div>
            </>
          )}

          {stage === "confirmed" && (
            <>
              <CheckCircle2 className="mx-auto mt-6 h-14 w-14 text-emerald-500" />
              <h3 id="vote-title" className="mt-3 text-xl font-bold">
                Vote successfully recorded.
              </h3>
              <p className="mt-1 text-sm text-muted">Your vote for {candidate.name} is now permanently stored on the blockchain.</p>
              <dl className="mt-5 space-y-2 rounded-xl bg-emerald-500/10 p-4 text-left text-xs">
                <div>
                  <dt className="text-faint">Transaction hash</dt>
                  <dd>
                    <TxHash hash={data?.hash} full />
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <dt className="text-faint">Block</dt>
                    <dd className="mono">#{data?.blockNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-faint">Gas used</dt>
                    <dd className="mono">{Number(data?.gasUsed ?? 0).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-faint">Fee</dt>
                    <dd className="mono">{data?.feeWei ? Number(formatEther(data.feeWei)).toFixed(6) : "-"} ETH</dd>
                  </div>
                </div>
              </dl>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
                <Link to="/results" onClick={onClose} className="btn-primary">
                  View Results
                </Link>
              </div>
            </>
          )}

          {stage === "failed" && (
            <>
              <XCircle className="mx-auto mt-6 h-14 w-14 text-rose-500" />
              <h3 id="vote-title" className="mt-3 text-xl font-bold">
                Vote not recorded
              </h3>
              <p className="mt-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-200">{data?.error}</p>
              <p className="mt-2 text-xs text-faint">No vote was counted and no state changed on the blockchain.</p>
              <button onClick={onClose} className="btn-secondary mt-6 w-full">
                Close
              </button>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
