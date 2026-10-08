import { useState } from "react";
import { BadgeCheck, Info, Users } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { deriveStatus } from "../utils/blockchain";
import { useNow } from "../utils/useNow";
import CandidateCard from "../components/CandidateCard";
import VotingModal from "../components/VotingModal";
import VoterStatus from "../components/VoterStatus";
import { EmptyState, PageHeader, SkeletonCard, StatusBadge } from "../components/ui";

const CLOSED_REASON = {
  setup: "Election not started",
  scheduled: "Voting not open yet",
  timeover: "Voting closed",
  ended: "Voting closed",
  unknown: "Unavailable",
};

export default function Candidates() {
  const { account, connectWallet, candidates, election, hasVoted, votedFor, isCorrectNetwork, sendTransaction, contractStatus } = useWeb3();
  const now = useNow();
  const status = deriveStatus(election, now);
  const [modal, setModal] = useState({ candidate: null, stage: "confirm", data: null });

  let voteState = "can-vote";
  let disabledReason = "";
  if (account && hasVoted) [voteState, disabledReason] = ["voted", "Already Voted"];
  else if (status.key !== "open") [voteState, disabledReason] = ["closed", CLOSED_REASON[status.key]];
  else if (!account) voteState = "connect";
  else if (!isCorrectNetwork) [voteState, disabledReason] = ["wrong-network", "Switch network to vote"];

  const openModal = (candidate) => setModal({ candidate, stage: "confirm", data: null });
  const closeModal = () => setModal({ candidate: null, stage: "confirm", data: null });

  const confirmVote = async () => {
    const { candidate } = modal;
    await sendTransaction(
      `Vote for ${candidate.name}`,
      (contract) => contract.vote(candidate.id),
      (stage, data) => setModal((m) => ({ ...m, stage, data: data ?? m.data }))
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Ballot"
        title="Candidates"
        description="Choose one candidate. Your vote is sent as a blockchain transaction signed by your wallet."
        actions={<StatusBadge status={status} className="!py-2" />}
      />

      {account && hasVoted && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
          <BadgeCheck className="h-5 w-5 shrink-0" />
          <p>
            <b>Already Voted.</b> This wallet has cast its vote. The smart contract will reject any further vote from this address.
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="xl:col-span-3">
          {contractStatus === "loading" && candidates.length === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} className="h-80" />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <EmptyState icon={Users} title="No candidates yet" description="The administrator has not registered any candidates on the smart contract." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {candidates.map((candidate, i) => (
                <div key={candidate.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <CandidateCard
                    candidate={candidate}
                    totalVotes={election?.totalVotes ?? 0}
                    voteState={voteState}
                    disabledReason={disabledReason}
                    isMyChoice={hasVoted && votedFor === candidate.id}
                    onVote={openModal}
                    onConnect={connectWallet}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <VoterStatus showBallotLink={false} />
          <div className="glass p-5 text-sm">
            <h3 className="section-title flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-500" /> What happens when I vote?
            </h3>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted">
              <li>The app prepares a call to <code className="mono">vote(candidateId)</code>.</li>
              <li>MetaMask shows the transaction and gas fee.</li>
              <li>You sign it with your private key (never shared).</li>
              <li>The network executes the smart contract and checks every rule.</li>
              <li>The vote is stored in a block and a <code className="mono">VoteCast</code> event is emitted.</li>
            </ol>
          </div>
        </aside>
      </div>

      <VotingModal candidate={modal.candidate} stage={modal.stage} data={modal.data} onConfirm={confirmVote} onClose={closeModal} />
    </div>
  );
}
