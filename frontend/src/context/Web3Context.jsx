/**
 * Global Web3 state shared by every page:
 *   - wallet connection (account, network)
 *   - election data read from the smart contract
 *   - a helper to send transactions with consistent toasts and status tracking
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getAddress } from "ethers";
import {
  CHAIN_ID,
  CONTRACT_ADDRESS,
  DEPLOY_BLOCK,
  NETWORK,
  getConnectedAccounts,
  getFriendlyError,
  getReadContract,
  getReadProvider,
  getSignerContract,
  getWalletChainId,
  hasMetaMask,
  isContractConfigured,
  isContractDeployed,
  mapCandidate,
  mapElectionDetails,
  requestAccounts,
  switchToAppNetwork,
} from "../utils/blockchain";

const Web3Context = createContext(null);

const REFRESH_INTERVAL_MS = 8000;
const CONNECTED_FLAG = "blockvote-connected";

export function Web3Provider({ children }) {
  // ---- wallet ----
  const [account, setAccount] = useState(null);
  const [walletChainId, setWalletChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // ---- contract data ----
  // contractStatus: loading | ready | not-configured | not-deployed | rpc-error
  const [contractStatus, setContractStatus] = useState("loading");
  const [contractError, setContractError] = useState("");
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [activity, setActivity] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ---- transactions sent from this browser session ----
  const [transactions, setTransactions] = useState([]);

  const accountRef = useRef(account);
  accountRef.current = account;

  const isCorrectNetwork = walletChainId === CHAIN_ID;
  const isOwner = Boolean(account && election?.admin && account.toLowerCase() === election.admin.toLowerCase());

  // ------------------------------------------------------------------
  // Reading blockchain data
  // ------------------------------------------------------------------

  const refresh = useCallback(async () => {
    if (!isContractConfigured()) {
      setContractStatus("not-configured");
      return;
    }
    try {
      if (!(await isContractDeployed())) {
        setContractStatus("not-deployed");
        return;
      }
      const contract = getReadContract();
      const [details, list] = await Promise.all([contract.getElectionDetails(), contract.getCandidates()]);
      setElection(mapElectionDetails(details));
      setCandidates(list.map(mapCandidate));

      const current = accountRef.current;
      setHasVoted(current ? await contract.hasVoted(current) : false);

      setContractStatus("ready");
      setContractError("");
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to read contract", error);
      setContractStatus("rpc-error");
      setContractError(getFriendlyError(error));
    }
  }, []);

  /** Loads the most recent contract events (the public, on-chain audit trail). */
  const loadActivity = useCallback(async () => {
    if (!isContractConfigured()) return;
    try {
      const contract = getReadContract();
      const provider = getReadProvider();
      const events = await contract.queryFilter("*", DEPLOY_BLOCK);
      const recent = events.slice(-30).reverse();

      // fetch block timestamps (one call per distinct block)
      const blockNumbers = [...new Set(recent.map((e) => e.blockNumber))];
      const blocks = await Promise.all(blockNumbers.map((n) => provider.getBlock(n)));
      const timeByBlock = Object.fromEntries(blocks.filter(Boolean).map((b) => [b.number, b.timestamp]));

      setActivity(
        recent
          .filter((e) => e.fragment) // only events we could decode with the ABI
          .map((e) => ({
            id: `${e.transactionHash}-${e.index}`,
            name: e.fragment.name,
            args: e.args ? e.args.toArray().map((a) => (typeof a === "bigint" ? a.toString() : a)) : [],
            txHash: e.transactionHash,
            blockNumber: e.blockNumber,
            timestamp: timeByBlock[e.blockNumber] ?? null,
          }))
      );

      // which candidate did the connected wallet vote for? (public on-chain info)
      const current = accountRef.current;
      if (current) {
        const mine = events.find((e) => e.fragment?.name === "VoteCast" && e.args?.[0]?.toLowerCase() === current.toLowerCase());
        setVotedFor(mine ? Number(mine.args[1]) : null);
      } else {
        setVotedFor(null);
      }
    } catch (error) {
      console.warn("Could not load activity", error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), loadActivity()]);
  }, [refresh, loadActivity]);

  // initial load + polling
  useEffect(() => {
    refreshAll();
    const timer = setInterval(refreshAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refreshAll]);

  // re-check voter status whenever the account changes
  useEffect(() => {
    refreshAll();
  }, [account, refreshAll]);

  // ------------------------------------------------------------------
  // Wallet connection
  // ------------------------------------------------------------------

  // Restore a previous connection silently (no popup) and listen to MetaMask events
  useEffect(() => {
    if (!hasMetaMask()) return undefined;

    (async () => {
      try {
        setWalletChainId(await getWalletChainId());
        if (localStorage.getItem(CONNECTED_FLAG) === "true") {
          const accounts = await getConnectedAccounts();
          if (accounts.length) setAccount(accounts[0]);
        }
      } catch (error) {
        console.warn(error);
      }
    })();

    const onAccountsChanged = (accounts) => {
      if (!accounts.length) {
        setAccount(null);
        localStorage.removeItem(CONNECTED_FLAG);
        toast("Wallet disconnected", { icon: "🔌" });
      } else {
        const next = getAddress(accounts[0]);
        setAccount((prev) => {
          if (prev && prev.toLowerCase() !== next.toLowerCase()) {
            toast.success(`Switched to account ${next.slice(0, 6)}...${next.slice(-4)}`);
          }
          return next;
        });
      }
    };
    const onChainChanged = (hexId) => setWalletChainId(Number.parseInt(hexId, 16));

    window.ethereum.on?.("accountsChanged", onAccountsChanged);
    window.ethereum.on?.("chainChanged", onChainChanged);
    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    if (!hasMetaMask()) {
      toast.error("MetaMask is not installed. Please install MetaMask to continue.");
      return null;
    }
    setConnecting(true);
    try {
      const accounts = await requestAccounts();
      setAccount(accounts[0]);
      localStorage.setItem(CONNECTED_FLAG, "true");
      const chainId = await getWalletChainId();
      setWalletChainId(chainId);
      toast.success("Wallet connected");
      if (chainId !== CHAIN_ID) {
        toast(`Please switch to the ${NETWORK.name} network.`, { icon: "⚠️" });
      }
      return accounts[0];
    } catch (error) {
      toast.error(error?.code === 4001 ? "Wallet connection request was rejected." : getFriendlyError(error));
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  /** MetaMask has no real "disconnect" API - we simply forget the account in the UI. */
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setHasVoted(false);
    setVotedFor(null);
    localStorage.removeItem(CONNECTED_FLAG);
    toast("Wallet disconnected from BlockVote", { icon: "👋" });
  }, []);

  const switchNetwork = useCallback(async () => {
    try {
      await switchToAppNetwork();
      setWalletChainId(await getWalletChainId());
      toast.success(`Switched to ${NETWORK.name}`);
    } catch (error) {
      toast.error(getFriendlyError(error));
    }
  }, []);

  // ------------------------------------------------------------------
  // Sending transactions
  // ------------------------------------------------------------------

  const updateTx = (id, patch) => setTransactions((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  /**
   * Sends a transaction through MetaMask and tracks its life-cycle:
   *   awaiting-signature -> pending (submitted, waiting to be mined) -> confirmed | failed
   *
   * @param {string}   label  Human readable description, e.g. "Vote for Alice"
   * @param {Function} action Receives the signer-connected contract and must return a tx
   * @param {Function} onStage Optional callback(stage, data) for UI (e.g. the voting modal)
   * @returns receipt summary, or null when it failed / was rejected
   */
  const sendTransaction = useCallback(
    async (label, action, onStage) => {
      if (!hasMetaMask()) {
        toast.error("MetaMask is not installed. Please install MetaMask to continue.");
        return null;
      }
      if (!accountRef.current) {
        toast.error("Please connect your wallet first.");
        return null;
      }
      const chainId = await getWalletChainId();
      setWalletChainId(chainId);
      if (chainId !== CHAIN_ID) {
        toast.error(`Please switch to the ${NETWORK.name} network.`);
        return null;
      }

      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setTransactions((list) => [{ id, label, status: "awaiting-signature", createdAt: Date.now() }, ...list].slice(0, 20));
      const toastId = toast.loading("Confirm this transaction in MetaMask...");
      onStage?.("awaiting-signature");

      try {
        const contract = await getSignerContract();
        const tx = await action(contract);

        updateTx(id, { status: "pending", hash: tx.hash });
        onStage?.("pending", { hash: tx.hash });
        toast.loading("Transaction submitted. Waiting for block confirmation...", { id: toastId });

        const receipt = await tx.wait();
        const gasPrice = receipt.gasPrice ?? tx.gasPrice ?? 0n;
        const result = {
          hash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          feeWei: (receipt.gasUsed * gasPrice).toString(),
          from: receipt.from,
        };

        await refreshAll(); // show the new on-chain state together with the confirmation
        updateTx(id, { status: "confirmed", ...result });
        onStage?.("confirmed", result);
        toast.success(`${label} - confirmed in block #${receipt.blockNumber}`, { id: toastId });
        return result;
      } catch (error) {
        console.warn("Transaction failed:", error);
        const message = getFriendlyError(error);
        updateTx(id, { status: "failed", error: message });
        onStage?.("failed", { error: message });
        toast.error(message, { id: toastId, duration: 6000 });
        await refreshAll();
        return null;
      }
    },
    [refreshAll]
  );

  const value = useMemo(
    () => ({
      // wallet
      account,
      walletChainId,
      connecting,
      isCorrectNetwork,
      isOwner,
      hasMetaMask: hasMetaMask(),
      connectWallet,
      disconnectWallet,
      switchNetwork,
      // contract data
      contractAddress: CONTRACT_ADDRESS,
      contractStatus,
      contractError,
      election,
      candidates,
      hasVoted,
      votedFor,
      activity,
      lastUpdated,
      refresh: refreshAll,
      // transactions
      transactions,
      sendTransaction,
    }),
    [
      account,
      walletChainId,
      connecting,
      isCorrectNetwork,
      isOwner,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      contractStatus,
      contractError,
      election,
      candidates,
      hasVoted,
      votedFor,
      activity,
      lastUpdated,
      refreshAll,
      transactions,
      sendTransaction,
    ]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used inside <Web3Provider>");
  return ctx;
}
