import { formatEther } from "ethers";
import { CheckCircle2, Clock, Loader2, Receipt, Wallet, XCircle } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { TxHash } from "./ui";

const STATUS = {
  "awaiting-signature": { icon: Wallet, label: "Awaiting signature", className: "text-orange-500" },
  pending: { icon: Loader2, label: "Pending (mining)", className: "text-indigo-500", spin: true },
  confirmed: { icon: CheckCircle2, label: "Confirmed", className: "text-emerald-500" },
  failed: { icon: XCircle, label: "Failed / rejected", className: "text-rose-500" },
};

/** Transactions sent from this browser session, with their live status. */
export default function TransactionList({ title = "Transaction status" }) {
  const { transactions } = useWeb3();

  return (
    <div className="glass p-5">
      <h3 className="section-title flex items-center gap-2">
        <Receipt className="h-5 w-5 text-indigo-500" /> {title}
      </h3>
      <p className="text-xs text-faint">Transactions you sent in this session</p>

      {transactions.length === 0 ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <Clock className="h-4 w-4" /> No transactions yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {transactions.map((tx) => {
            const s = STATUS[tx.status];
            const Icon = s.icon;
            return (
              <li key={tx.id} className="rounded-xl border border-[color:var(--glass-border)] p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{tx.label}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${s.className}`}>
                    <Icon className={`h-3.5 w-3.5 ${s.spin ? "animate-spin" : ""}`} /> {s.label}
                  </span>
                </div>
                {tx.hash && (
                  <div className="mt-1 text-xs text-faint">
                    tx <TxHash hash={tx.hash} />
                  </div>
                )}
                {tx.status === "confirmed" && (
                  <p className="mt-1 text-xs text-faint">
                    Block #{tx.blockNumber} · Gas {Number(tx.gasUsed).toLocaleString()} · Fee {Number(formatEther(tx.feeWei)).toFixed(6)} ETH
                  </p>
                )}
                {tx.status === "failed" && <p className="mt-1 text-xs text-rose-500">{tx.error}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
