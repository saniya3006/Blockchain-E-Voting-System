import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/** Accessible modal shell: closes on Escape / backdrop click unless `locked`. */
export default function Modal({ open, onClose, locked = false, children, labelledBy }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && !locked && onClose?.();
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, locked, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => !locked && onClose?.()} />
      <div className="glass-strong relative w-full max-w-md animate-scale-in p-6 shadow-2xl">
        {!locked && (
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-faint hover:bg-indigo-500/10" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
