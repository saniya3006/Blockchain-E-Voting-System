import { useEffect, useRef, useState } from "react";
import { ChevronDown, Crown, LogOut, Network, RefreshCw, Wallet } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CHAIN_ID, NETWORK, NETWORKS, getBalance, shortenAddress } from "../utils/blockchain";
import { CopyButton, Spinner } from "./ui";

/**
 * Wallet connection button.
 * Not connected -> "Connect Wallet" (calls eth_requestAccounts via MetaMask)
 * Connected     -> "0x12AB...89CD" with a dropdown showing network, balance and role
 */
export default function WalletConnect({ fullWidth = false }) {
  const { account, connecting, connectWallet, disconnectWallet, isCorrectNetwork, walletChainId, switchNetwork, isOwner, hasMetaMask, hasVoted } =
    useWeb3();
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open || !account) return;
    getBalance(account)
      .then((b) => setBalance(Number(b).toFixed(4)))
      .catch(() => setBalance(null));
  }, [open, account, walletChainId]);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!hasMetaMask) {
    return (
      <a href="https://metamask.io/download/" target="_blank" rel="noreferrer" className={`btn-secondary ${fullWidth ? "w-full" : ""}`}>
        <Wallet className="h-4 w-4" /> Install MetaMask
      </a>
    );
  }

  if (!account) {
    return (
      <button onClick={connectWallet} disabled={connecting} className={`btn-primary ${fullWidth ? "w-full" : ""}`}>
        {connecting ? <Spinner /> : <Wallet className="h-4 w-4" />}
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <button onClick={switchNetwork} className={`btn bg-amber-500 text-white hover:bg-amber-400 ${fullWidth ? "w-full" : ""}`}>
        <Network className="h-4 w-4" /> Switch to {NETWORK.shortName}
      </button>
    );
  }

  return (
    <div className={`relative ${fullWidth ? "w-full" : ""}`} ref={menuRef}>
      <button onClick={() => setOpen((o) => !o)} className={`btn-secondary ${fullWidth ? "w-full" : ""}`} aria-expanded={open}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="mono">{shortenAddress(account)}</span>
        {isOwner && <Crown className="h-3.5 w-3.5 text-amber-500" />}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="glass-strong absolute right-0 z-50 mt-2 w-72 animate-scale-in p-4 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Connected wallet</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="mono break-all text-xs">{account}</span>
            <CopyButton value={account} />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Network</dt>
              <dd className="font-medium">{NETWORKS[walletChainId]?.shortName ?? `Chain ${walletChainId}`}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Chain ID</dt>
              <dd className="mono">{CHAIN_ID}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Balance</dt>
              <dd className="font-medium">{balance ?? "..."} ETH</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Role</dt>
              <dd className="font-medium">{isOwner ? "Administrator" : "Voter"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Voting status</dt>
              <dd className={`font-medium ${hasVoted ? "text-emerald-500" : ""}`}>{hasVoted ? "Already voted" : "Not voted"}</dd>
            </div>
          </dl>
          <button onClick={() => { setOpen(false); disconnectWallet(); }} className="btn-secondary mt-4 w-full text-rose-500">
            <LogOut className="h-4 w-4" /> Disconnect
          </button>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-faint">
            <RefreshCw className="mt-0.5 h-3 w-3 shrink-0" />
            To use another account, switch it inside MetaMask - the app updates automatically.
          </p>
        </div>
      )}
    </div>
  );
}
