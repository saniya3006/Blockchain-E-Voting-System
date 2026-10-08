/**
 * All blockchain access for the frontend lives in this file.
 *
 *  - READS  go through a JSON-RPC provider (no wallet needed, free, no gas)
 *  - WRITES go through MetaMask (BrowserProvider + Signer), which asks the user
 *    to approve and sign every transaction
 */
import { BrowserProvider, Contract, JsonRpcProvider, formatEther, getAddress, isAddress } from "ethers";
import deployment from "../contracts/Voting.json";

// ---------------------------------------------------------------------------
// Configuration (.env values override the file written by scripts/deploy.js)
// ---------------------------------------------------------------------------

export const NETWORKS = {
  31337: {
    name: "Hardhat Localhost",
    shortName: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
    currency: "ETH",
    explorer: null,
  },
  11155111: {
    name: "Sepolia Testnet",
    shortName: "Sepolia",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    currency: "SepoliaETH",
    explorer: "https://sepolia.etherscan.io",
  },
};

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || deployment.address || "").trim();
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || deployment.chainId || 31337);
export const NETWORK = NETWORKS[CHAIN_ID] || {
  name: `Chain ${CHAIN_ID}`,
  shortName: `Chain ${CHAIN_ID}`,
  rpcUrl: "",
  currency: "ETH",
  explorer: null,
};
export const RPC_URL = (import.meta.env.VITE_RPC_URL || NETWORK.rpcUrl || "").trim();
export const DEPLOY_BLOCK = Number(deployment.deployBlock || 0);
export const VOTING_ABI = deployment.abi;

/** Election phases as defined by the `Phase` enum in Voting.sol */
export const PHASE = { SETUP: 0, ACTIVE: 1, ENDED: 2 };

export function isContractConfigured() {
  return isAddress(CONTRACT_ADDRESS);
}

// ---------------------------------------------------------------------------
// Providers & contract instances
// ---------------------------------------------------------------------------

let readProvider;

/** Provider used for all read-only calls. Works without a wallet. */
export function getReadProvider() {
  if (!readProvider) {
    readProvider = RPC_URL
      ? new JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true, polling: true, pollingInterval: 4000 })
      : new BrowserProvider(window.ethereum);
  }
  return readProvider;
}

export function getReadContract() {
  return new Contract(CONTRACT_ADDRESS, VOTING_ABI, getReadProvider());
}

/** Contract connected to the user's MetaMask signer - required for transactions. */
export async function getSignerContract() {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, VOTING_ABI, signer);
}

/** Returns true if bytecode exists at the configured address on the read network. */
export async function isContractDeployed() {
  const code = await getReadProvider().getCode(CONTRACT_ADDRESS);
  return code && code !== "0x";
}

// ---------------------------------------------------------------------------
// MetaMask helpers
// ---------------------------------------------------------------------------

export function hasMetaMask() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

/** Opens the MetaMask connection popup (eth_requestAccounts). */
export async function requestAccounts() {
  if (!hasMetaMask()) throw new Error("METAMASK_MISSING");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts.map((a) => getAddress(a));
}

/** Returns already-authorised accounts without showing a popup. */
export async function getConnectedAccounts() {
  if (!hasMetaMask()) return [];
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts.map((a) => getAddress(a));
}

export async function getWalletChainId() {
  if (!hasMetaMask()) return null;
  const hex = await window.ethereum.request({ method: "eth_chainId" });
  return Number.parseInt(hex, 16);
}

/** Asks MetaMask to switch to the app's network, adding it first if unknown. */
export async function switchToAppNetwork() {
  const chainIdHex = `0x${CHAIN_ID.toString(16)}`;
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainIdHex }] });
  } catch (error) {
    // 4902 = chain not added to MetaMask yet
    const code = error?.code ?? error?.data?.originalError?.code;
    if (code !== 4902) throw error;
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: NETWORK.name,
          rpcUrls: [RPC_URL || NETWORK.rpcUrl],
          nativeCurrency: { name: NETWORK.currency, symbol: "ETH", decimals: 18 },
          ...(NETWORK.explorer ? { blockExplorerUrls: [NETWORK.explorer] } : {}),
        },
      ],
    });
  }
}

export async function getBalance(address) {
  const provider = hasMetaMask() ? new BrowserProvider(window.ethereum) : getReadProvider();
  return formatEther(await provider.getBalance(address));
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function shortenAddress(address, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function shortenHash(hash, chars = 6) {
  if (!hash) return "";
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function explorerTxUrl(hash) {
  return NETWORK.explorer ? `${NETWORK.explorer}/tx/${hash}` : null;
}

export function explorerAddressUrl(address) {
  return NETWORK.explorer ? `${NETWORK.explorer}/address/${address}` : null;
}

export function formatDateTime(unixSeconds) {
  if (!unixSeconds) return "Not set";
  return new Date(Number(unixSeconds) * 1000).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convert a <input type="datetime-local"> value to unix seconds and back */
export function toUnixSeconds(dateTimeLocal) {
  return Math.floor(new Date(dateTimeLocal).getTime() / 1000);
}

export function toDateTimeLocal(unixSeconds) {
  const d = new Date(unixSeconds * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------------------------------------------------------------------------
// Data mapping
// ---------------------------------------------------------------------------

export function mapElectionDetails(raw) {
  return {
    title: raw.title,
    description: raw.description,
    startTime: Number(raw.start),
    endTime: Number(raw.end),
    phase: Number(raw.currentPhase),
    candidateCount: Number(raw.candidateCount),
    totalVotes: Number(raw.votesCast),
    votingOpen: raw.votingOpen,
    admin: raw.admin,
  };
}

export function mapCandidate(raw) {
  return {
    id: Number(raw.id),
    name: raw.name,
    description: raw.description,
    voteCount: Number(raw.voteCount),
  };
}

/**
 * Derives a single display status from the on-chain phase and the clock.
 * Mirrors Voting.getElectionStatus() so the UI updates every second.
 */
export function deriveStatus(election, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!election) return { key: "unknown", label: "Unknown", tone: "slate" };
  if (election.phase === PHASE.SETUP) return { key: "setup", label: "Not Started", tone: "slate" };
  if (election.phase === PHASE.ENDED) return { key: "ended", label: "Election Ended", tone: "rose" };
  if (nowSeconds < election.startTime) return { key: "scheduled", label: "Scheduled", tone: "amber" };
  if (nowSeconds > election.endTime) return { key: "timeover", label: "Voting Period Over", tone: "rose" };
  return { key: "open", label: "Voting Open", tone: "emerald" };
}

/** Results are final when the admin ended the election or the voting window closed. */
export function areResultsFinal(election, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!election) return false;
  return election.phase === PHASE.ENDED || (election.phase === PHASE.ACTIVE && nowSeconds > election.endTime);
}

// ---------------------------------------------------------------------------
// Error handling - turn low-level wallet / RPC / contract errors into
// messages a user can understand.
// ---------------------------------------------------------------------------

const CONTRACT_ERROR_MESSAGES = {
  NotOwner: "Only the election administrator can perform this action. The smart contract rejected the request.",
  AlreadyVoted: "This wallet has already voted. The smart contract allows only one vote per wallet.",
  ElectionNotActive: "The election is not active, so votes cannot be cast.",
  VotingNotStarted: "Voting has not started yet. Please wait for the start time.",
  VotingPeriodOver: "The voting period is over. No more votes are accepted.",
  InvalidTimeRange: "Invalid election time range. The end time must be after the start time and in the future.",
  NotEnoughCandidates: "At least two candidates are required to start the election.",
  ResultsNotFinal: "Final results are available only after the election ends.",
};

const PHASE_NAMES = ["Setup", "Active", "Ended"];

/** Searches nested error objects for ABI-encoded revert data. */
function findRevertData(error, depth = 0) {
  if (!error || depth > 6 || typeof error !== "object") return null;
  for (const key of ["data", "error", "info", "originalError", "cause", "payload"]) {
    const value = error[key];
    if (typeof value === "string" && /^0x[0-9a-fA-F]{8,}$/.test(value)) return value;
    if (value && typeof value === "object") {
      const nested = findRevertData(value, depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

function decodeContractError(error) {
  if (error?.revert?.name) return error.revert;
  const data = findRevertData(error);
  if (!data) return null;
  try {
    const contract = new Contract(CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000", VOTING_ABI);
    const parsed = contract.interface.parseError(data);
    return parsed ? { name: parsed.name, args: parsed.args } : null;
  } catch {
    return null;
  }
}

/** Collects every message string inside a (possibly nested) error. */
function collectMessages(error, depth = 0, out = []) {
  if (!error || depth > 6) return out;
  if (typeof error === "string") {
    out.push(error);
    return out;
  }
  if (typeof error !== "object") return out;
  for (const key of ["shortMessage", "message", "reason"]) {
    if (typeof error[key] === "string") out.push(error[key]);
  }
  for (const key of ["error", "info", "data", "cause", "originalError"]) {
    if (error[key] && typeof error[key] === "object") collectMessages(error[key], depth + 1, out);
  }
  return out;
}

export function getFriendlyError(error) {
  if (!error) return "Unknown error.";
  if (error.message === "METAMASK_MISSING") {
    return "MetaMask is not installed. Please install MetaMask to continue.";
  }

  // 1. User clicked "Reject" in MetaMask
  const code = error.code ?? error.info?.error?.code ?? error.error?.code;
  if (code === "ACTION_REJECTED" || code === 4001) return "Transaction rejected by user.";
  if (code === -32002) return "A MetaMask request is already pending. Please open MetaMask to continue.";

  // 2. Custom error from the smart contract
  const revert = decodeContractError(error);
  if (revert) {
    const { name, args } = revert;
    if (name === "InvalidCandidate") return `Invalid candidate (ID ${args?.[0]?.toString() ?? "?"}).`;
    if (name === "EmptyField") return `The ${args?.[0] ?? "required"} field cannot be empty.`;
    if (name === "InvalidPhase") {
      const expected = PHASE_NAMES[Number(args?.[0])] ?? "?";
      const actual = PHASE_NAMES[Number(args?.[1])] ?? "?";
      return `Not allowed in the current election phase (requires "${expected}", election is "${actual}").`;
    }
    if (CONTRACT_ERROR_MESSAGES[name]) return CONTRACT_ERROR_MESSAGES[name];
    return `Smart contract rejected the transaction (${name}).`;
  }

  // 3. Common wallet / network problems
  const text = collectMessages(error).join(" | ").toLowerCase();
  if (code === "INSUFFICIENT_FUNDS" || text.includes("insufficient funds")) {
    return "Insufficient funds to pay the gas fee. Use a funded test account (test ETH only).";
  }
  if (text.includes("nonce too high") || text.includes("nonce has already been used") || text.includes("invalid nonce")) {
    return "Nonce mismatch - the local blockchain was probably restarted. In MetaMask open Settings > Advanced > Clear activity tab data, then try again.";
  }
  if (text.includes("user rejected") || text.includes("user denied")) return "Transaction rejected by user.";
  if (
    code === "NETWORK_ERROR" ||
    code === "SERVER_ERROR" ||
    text.includes("failed to fetch") ||
    text.includes("econnrefused") ||
    text.includes("could not coalesce") ||
    text.includes("connection")
  ) {
    return `Cannot reach the blockchain RPC (${RPC_URL || "MetaMask"}). Is the network running?`;
  }
  if (code === "CALL_EXCEPTION") {
    return "The smart contract call failed. Check that the contract is deployed on the selected network.";
  }

  return error.shortMessage || error.reason || error.message || "Something went wrong.";
}
