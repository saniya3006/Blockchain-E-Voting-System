import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

/** Generic "are you sure?" dialog used before admin blockchain transactions. */
export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", tone = "primary", onConfirm, onCancel }) {
  const buttonClass = { primary: "btn-primary", danger: "btn-danger", success: "btn-success" }[tone];
  return (
    <Modal open={open} onClose={onCancel} labelledBy="confirm-title">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 id="confirm-title" className="text-lg font-semibold">
            {title}
          </h3>
          <div className="mt-1 text-sm text-muted">{message}</div>
        </div>
      </div>
      <p className="mt-4 rounded-xl bg-indigo-500/10 p-3 text-xs text-muted">
        This sends a blockchain transaction. MetaMask will ask you to confirm it and pay a small gas fee (test ETH only).
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button onClick={onConfirm} className={buttonClass}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
