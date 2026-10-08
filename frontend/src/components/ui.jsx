/** Small reusable UI building blocks used across pages. */
import { useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { explorerAddressUrl, explorerTxUrl, shortenAddress, shortenHash } from "../utils/blockchain";

/** Colour for a candidate - follows the candidate ID, never its rank. */
export function candidateColor(id) {
  return `var(--chart-${(id % 8) + 1})`;
}

export function initials(name = "") {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "?"
  );
}

export function Avatar({ id, name, size = "md" }) {
  const sizes = { sm: "h-9 w-9 text-xs", md: "h-14 w-14 text-lg", lg: "h-20 w-20 text-2xl" };
  const color = candidateColor(id);
  return (
    <div
      className={`${sizes[size]} relative flex shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-lg`}
      style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, #1e1b4b))` }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}

const TONES = {
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
  slate: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  indigo: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30",
};
const DOTS = { emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500", slate: "bg-slate-400", indigo: "bg-indigo-500" };

export function StatusBadge({ status, className = "" }) {
  const tone = status?.tone ?? "slate";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}>
      <span className="relative flex h-2 w-2">
        {status?.key === "open" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${DOTS[tone]} opacity-75`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${DOTS[tone]}`} />
      </span>
      {status?.label ?? "Unknown"}
    </span>
  );
}

export function Pill({ tone = "indigo", icon: Icon, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, hint, accent = "from-indigo-500 to-violet-500" }) {
  return (
    <div className="glass card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl bg-gradient-to-br ${accent} p-2.5 text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="animate-fade-up">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Spinner({ className = "h-4 w-4" }) {
  return <Loader2 className={`${className} animate-spin`} />;
}

export function CopyButton({ value, className = "" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable - ignore */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-md p-1 text-faint transition hover:bg-indigo-500/10 hover:text-indigo-500 ${className}`}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

/** Shortened tx hash with copy button and (on public networks) an explorer link. */
export function TxHash({ hash, full = false }) {
  if (!hash) return null;
  const url = explorerTxUrl(hash);
  return (
    <span className="inline-flex max-w-full items-center gap-1">
      <span className={`mono ${full ? "break-all" : ""}`}>{full ? hash : shortenHash(hash)}</span>
      <CopyButton value={hash} />
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="rounded-md p-1 text-faint hover:text-indigo-500" title="View on block explorer">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </span>
  );
}

export function AddressLabel({ address, chars = 4 }) {
  if (!address) return null;
  const url = explorerAddressUrl(address);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="mono" title={address}>
        {shortenAddress(address, chars)}
      </span>
      <CopyButton value={address} />
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="rounded-md p-1 text-faint hover:text-indigo-500" title="View on block explorer">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="glass flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 rounded-2xl bg-indigo-500/10 p-4 text-indigo-500 dark:text-indigo-300">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonCard({ className = "h-40" }) {
  return <div className={`glass animate-pulse ${className}`} />;
}
