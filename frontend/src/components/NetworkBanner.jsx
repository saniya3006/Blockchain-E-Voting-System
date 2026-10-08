import { AlertTriangle, PlugZap, ServerCrash, Wallet } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CHAIN_ID, CONTRACT_ADDRESS, NETWORK, RPC_URL } from "../utils/blockchain";

function Banner({ icon: Icon, tone, title, children, action }) {
  const tones = {
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200",
    indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200",
  };
  return (
    <div className={`mb-6 flex flex-col gap-3 rounded-2xl border p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between ${tones[tone]}`} role="alert">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold">{title}</p>
          <div className="mt-0.5 opacity-90">{children}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

/** Shows the most important environment problem (if any) at the top of each page. */
export default function NetworkBanner() {
  const { contractStatus, contractError, hasMetaMask, account, isCorrectNetwork, switchNetwork, refresh } = useWeb3();

  if (contractStatus === "not-configured") {
    return (
      <Banner icon={PlugZap} tone="amber" title="Smart contract not configured">
        No contract address found. Start the local blockchain (<code className="mono">npx hardhat node</code>) and deploy with{" "}
        <code className="mono">npm run deploy:local</code>, or set <code className="mono">VITE_CONTRACT_ADDRESS</code> in <code className="mono">.env</code>.
      </Banner>
    );
  }
  if (contractStatus === "not-deployed") {
    return (
      <Banner
        icon={PlugZap}
        tone="amber"
        title="Contract unavailable on this network"
        action={<button onClick={refresh} className="btn-secondary shrink-0">Retry</button>}
      >
        No contract code at <code className="mono break-all">{CONTRACT_ADDRESS}</code> on {NETWORK.name}. If you restarted{" "}
        <code className="mono">npx hardhat node</code>, the chain was reset - redeploy with <code className="mono">npm run demo:local</code>.
      </Banner>
    );
  }
  if (contractStatus === "rpc-error") {
    return (
      <Banner
        icon={ServerCrash}
        tone="rose"
        title="Cannot reach the blockchain"
        action={<button onClick={refresh} className="btn-secondary shrink-0">Retry</button>}
      >
        {contractError || `RPC ${RPC_URL} is not responding.`} For local development run <code className="mono">npx hardhat node</code>.
      </Banner>
    );
  }
  if (!hasMetaMask) {
    return (
      <Banner
        icon={Wallet}
        tone="indigo"
        title="MetaMask is not installed"
        action={
          <a href="https://metamask.io/download/" target="_blank" rel="noreferrer" className="btn-primary shrink-0">
            Install MetaMask
          </a>
        }
      >
        You can browse the election and results, but you need MetaMask to vote.
      </Banner>
    );
  }
  if (account && !isCorrectNetwork) {
    return (
      <Banner
        icon={AlertTriangle}
        tone="amber"
        title="Wrong network"
        action={<button onClick={switchNetwork} className="btn-primary shrink-0">Switch network</button>}
      >
        Please switch to the {NETWORK.name} network (chain ID {CHAIN_ID}) in MetaMask.
      </Banner>
    );
  }
  return null;
}
