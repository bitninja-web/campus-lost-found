"use client";
import { useItems } from "@/context/ItemsContext";

export default function Toast() {
  const { toasts, removeToast } = useItems();

  const icons = { success: "✅", error: "❌", info: "ℹ️" };

  return (
    <div className="toast-box" role="region" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} role="alert">
          <span className="toast-icon">{icons[t.type] || "ℹ️"}</span>
          <span className="toast-msg">{t.msg}</span>
          <button
            className="toast-close"
            aria-label="Dismiss"
            onClick={() => removeToast(t.id)}
          >
            ✕
          </button>
          {/* Auto-dismiss progress bar */}
          <span className="toast-progress" />
        </div>
      ))}
    </div>
  );
}
