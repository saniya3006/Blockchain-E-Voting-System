import { Link } from "react-router-dom";
import { BadgeCheck, CircleSlash, Repeat, UserCircle2, Vote, Wallet } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { deriveStatus } from "../utils/blockchain";
import { useNow } from "../utils/useNow";
import { AddressLabel, Pill } from "./ui";

/**
 * Shows the connected wallet's voting status. After voting, it offers a
 * "try to vote again" button to demonstrate that the SMART CONTRACT itself
 * rejects a second vote (not just the user interface).
 */
export default function VoterStatus({ showBallotLink = true }) {
  const { account, connectWallet, hasVoted, votedFor, candidates, election, isOwner, isCorrectNetwork, sendTransaction } = useWeb3();
  const now = useNow();
  const status = deriveStatus(election, now);
  const votingOpen = status.key === "open";
  const votedName = candidates.find((c) => c.id === votedFor)?.name;

  const tryVoteAgain = () =>
    sendTransaction("Second vote attempt (double-vote test)", (contract) => contract.vote(votedFor ?? 0));

  return (
    <div className="glass p-5">
      <h3 className="section-title flex items-center gap-2">
        <UserCircle2 className="h-5 w-5 text-indigo-500" /> Your voter status
      </h3>

      {!account ? (
        <div className="mt-4">
          <p className="text-sm text-muted">Connect MetaMask to check whether your wallet can vote.</p>
          <button onClick={connectWallet} className="btn-primary mt-4 w-full">
            <Wallet className="h-4 w-4" /> Connect Wallet
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">Wallet</span>
            <AddressLabel address={account} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">Role</span>
            <Pill tone={isOwner ? "amber" : "indigo"}>{isOwner ? "Administrator" : "Voter"}</Pill>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">Voting status</span>
            {hasVoted ? (
              <Pill tone="emerald" icon={BadgeCheck}>
                Already Voted
              </Pill>
            ) : (
              <Pill tone="slate" icon={CircleSlash}>
                Not voted yet
              </Pill>
            )}
          </div>
          {hasVoted && votedName && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted">Voted for</span>
              <span className="font-semibold">{votedName}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">Voting open</span>
            <span className={`font-semibold ${votingOpen ? "text-emerald-500" : "text-rose-500"}`}>{votingOpen ? "Yes" : "No"}</span>
          </div>

          {!hasVoted && votingOpen && isCorrectNetwork && showBallotLink && (
            <Link to="/candidates" className="btn-primary mt-2 w-full">
              <Vote className="h-4 w-4" /> Cast your vote
            </Link>
          )}

          {hasVoted && votingOpen && isCorrectNetwork && (
            <div className="mt-2 rounded-xl border border-dashed border-[color:var(--glass-border)] p-3">
              <p className="text-xs text-muted">
                <b>Demo:</b> the UI hides the vote button, but what if someone bypasses the UI? Send a second vote directly to the contract and
                watch it get rejected.
              </p>
              <button onClick={tryVoteAgain} className="btn-secondary mt-3 w-full">
                <Repeat className="h-4 w-4" /> Try to vote again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
