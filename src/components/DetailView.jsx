"use client";
import { useEffect, useCallback, useRef } from "react";
import { formatDate, copyToClipboard } from "@/lib/utils";
import { useItems } from "@/context/ItemsContext";
import { useConfirm } from "./ConfirmDialog";

export default function DetailView({ item, onClose, isAdmin }) {
  const { claimItem, deleteItem, addToast } = useItems();
  const confirm = useConfirm();
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const contactChipRef = useRef(null);
  const contactBtnRef = useRef(null);

  const isClaimed = item.status === "Claimed";
  const badgeClass =
    item.status === "Lost"
      ? "badge-lost"
      : item.status === "Found"
        ? "badge-found"
        : "badge-claimed";

  const imgSrc =
    item.image ||
    `https://placehold.co/800x500/e2e8f0/94a3b8?text=${encodeURIComponent(item.category)}`;

  const itemId = item.id || item._id;

  // Close animation
  const handleClose = useCallback(() => {
    if (panelRef.current) {
      panelRef.current.style.transition = "opacity .2s ease, transform .2s ease";
      panelRef.current.style.opacity = "0";
      panelRef.current.style.transform = "scale(.96) translateY(16px)";
    }
    if (overlayRef.current) {
      overlayRef.current.style.transition = "opacity .22s ease";
      overlayRef.current.style.opacity = "0";
    }
    setTimeout(() => onClose(), 220);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === overlayRef.current) handleClose();
    },
    [handleClose]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [handleClose]);

  const handleCopyContact = useCallback(
    (el) => {
      copyToClipboard(item.contact, `Copied: ${item.contact}`, el, addToast);
    },
    [item.contact, addToast]
  );

  const handleClaim = useCallback(async () => {
    const ok = await confirm({
      icon: "✅",
      title: "Mark as Claimed",
      message: `Mark "${item.name}" as claimed/returned?`,
      confirmText: "Yes, Mark Claimed",
      cancelText: "Cancel",
      variant: "claim",
    });
    if (ok) {
      claimItem(itemId);
      handleClose();
    }
  }, [itemId, item.name, claimItem, handleClose, confirm]);

  const handleDelete = useCallback(async () => {
    const ok = await confirm({
      icon: "🗑️",
      title: "Remove Item",
      message: `Permanently remove "${item.name}"? This action cannot be undone.`,
      confirmText: "Remove",
      cancelText: "Keep It",
      variant: "danger",
    });
    if (ok) {
      deleteItem(itemId);
      handleClose();
    }
  }, [itemId, item.name, deleteItem, handleClose, confirm]);

  return (
    <div
      ref={overlayRef}
      className="detail-view"
      onClick={handleBackdropClick}
    >
      <div ref={panelRef} className="detail-panel">
        <button
          className="detail-close-btn"
          title="Close"
          aria-label="Close detail"
          onClick={handleClose}
        >
          ✕
        </button>

        <div
          className="detail-hero"
          style={{ "--hero-img-url": `url('${imgSrc}')` }}
        >
          <span className={`badge ${badgeClass}`}>{item.status}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt={item.name} />
        </div>

        <div className="detail-body">
          <div className="detail-cat">{item.category}</div>
          <h2 className="detail-title">{item.name}</h2>

          <div className="detail-chips">
            <span className="detail-chip">
              📍 <strong>{item.location}</strong>
            </span>
            <span className="detail-chip">
              📅 <strong>{formatDate(item.date)}</strong>
            </span>
            <span
              ref={contactChipRef}
              className="detail-chip chip-contact"
              title="Click to copy contact"
              role="button"
              tabIndex={0}
              aria-label={`Copy contact: ${item.contact}`}
              onClick={() => handleCopyContact(contactChipRef.current)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCopyContact(contactChipRef.current);
                }
              }}
            >
              📩 {item.contact}
            </span>
          </div>

          <div className="detail-desc-label">Description</div>
          <p className="detail-desc">
            {item.description || "No description provided."}
          </p>

          {/* ── Admin Audit Trail Section ── */}
          {isAdmin && (
            <div className="audit-trail">
              <h3 className="audit-title">🔒 Audit Trail</h3>

              <div className="audit-grid">
                {/* Submitted By */}
                {item.submittedBy && (
                  <div className="audit-card">
                    <div className="audit-card-header">
                      <span className="audit-card-icon">📝</span>
                      <strong>Submitted By</strong>
                    </div>
                    <div className="audit-card-body">
                      <div className="audit-row">
                        <span className="audit-label">Name:</span>
                        <span>{item.submittedBy.name}</span>
                      </div>
                      <div className="audit-row">
                        <span className="audit-label">Email:</span>
                        <span>{item.submittedBy.email}</span>
                      </div>
                      <div className="audit-row">
                        <span className="audit-label">Role:</span>
                        <span className={`audit-role-tag ${item.submittedBy.role}`}>
                          {item.submittedBy.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                        </span>
                      </div>
                      {item.submittedAt && (
                        <div className="audit-row">
                          <span className="audit-label">Date:</span>
                          <span>{new Date(item.submittedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Claimed By */}
                {item.claimedBy && item.claimedBy.name && (
                  <div className="audit-card">
                    <div className="audit-card-header">
                      <span className="audit-card-icon">✅</span>
                      <strong>Claimed By</strong>
                    </div>
                    <div className="audit-card-body">
                      <div className="audit-row">
                        <span className="audit-label">Name:</span>
                        <span>{item.claimedBy.name}</span>
                      </div>
                      <div className="audit-row">
                        <span className="audit-label">Email:</span>
                        <span>{item.claimedBy.email}</span>
                      </div>
                      {item.claimedBy.claimedAt && (
                        <div className="audit-row">
                          <span className="audit-label">Claimed At:</span>
                          <span>{new Date(item.claimedBy.claimedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Handed Over */}
                {item.handedOverAt && (
                  <div className="audit-card">
                    <div className="audit-card-header">
                      <span className="audit-card-icon">🤝</span>
                      <strong>Handed Over</strong>
                    </div>
                    <div className="audit-card-body">
                      <div className="audit-row">
                        <span className="audit-label">Date:</span>
                        <span>{new Date(item.handedOverAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status History Timeline */}
              {item.statusHistory && item.statusHistory.length > 0 && (
                <div className="audit-timeline">
                  <h4 className="audit-timeline-title">📋 Status History</h4>
                  <div className="timeline">
                    {item.statusHistory.map((entry, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className={`timeline-status badge-${entry.status?.toLowerCase()}`}>
                              {entry.status}
                            </span>
                            <span className="timeline-date">
                              {entry.changedAt
                                ? new Date(entry.changedAt).toLocaleString()
                                : "—"}
                            </span>
                          </div>
                          <div className="timeline-detail">
                            Changed by{" "}
                            <strong>{entry.changedBy?.name || "System"}</strong>
                            {entry.changedBy?.email && (
                              <span className="timeline-email">
                                ({entry.changedBy.email})
                              </span>
                            )}
                          </div>
                          {entry.note && (
                            <div className="timeline-note">{entry.note}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions — Claim for everyone, Delete admin-only */}
          <div className="detail-actions">
            <button
              ref={contactBtnRef}
              className="btn btn-primary"
              onClick={() => handleCopyContact(contactBtnRef.current)}
            >
              📩 Copy Contact
            </button>
            {!isClaimed && (
              <button className="claim-btn" onClick={handleClaim}>
                ✅ Mark as Claimed
              </button>
            )}
            {isAdmin && (
              <button className="del-btn" onClick={handleDelete}>
                🗑 Remove Item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
