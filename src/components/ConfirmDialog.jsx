"use client";
import { createContext, useContext, useState, useCallback } from "react";

const ConfirmContext = createContext(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback(
    ({ title, message, icon = "⚠️", confirmText = "Confirm", cancelText = "Cancel", variant = "danger" }) =>
      new Promise((resolve) => {
        setState({ title, message, icon, confirmText, cancelText, variant, resolve });
      }),
    []
  );

  const handleConfirm = useCallback(() => {
    state?.resolve(true);
    setState(null);
  }, [state]);

  const handleCancel = useCallback(() => {
    state?.resolve(false);
    setState(null);
  }, [state]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="confirm-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
        >
          <div className="confirm-box">
            <span className="confirm-icon">{state.icon}</span>
            <h3 className="confirm-title">{state.title}</h3>
            <p className="confirm-message">{state.message}</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={handleCancel}>
                {state.cancelText}
              </button>
              <button
                className={`btn ${state.variant === "claim" ? "btn-claimed-action" : "btn-danger"}`}
                onClick={handleConfirm}
                autoFocus
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
