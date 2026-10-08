import { Code2, ShieldAlert } from "lucide-react";
import { CHAIN_ID, CONTRACT_ADDRESS, NETWORK } from "../utils/blockchain";
import { AddressLabel } from "./ui";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[color:var(--glass-border)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <b>Educational prototype.</b> This project is an educational prototype and is not intended for use in real public elections. Votes
            on a public blockchain are not secret, and wallet addresses do not prove real-world voter identity.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>BlockVote · Decentralized E-Voting System · B.Tech CSE Mini Project</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              {NETWORK.name} (chain {CHAIN_ID})
            </span>
            {CONTRACT_ADDRESS && (
              <span className="inline-flex items-center gap-1">
                Contract <AddressLabel address={CONTRACT_ADDRESS} />
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Code2 className="h-3.5 w-3.5" /> Solidity · Hardhat · React · ethers.js
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
