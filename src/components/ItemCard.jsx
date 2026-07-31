"use client";
import { useCallback, useRef, useState } from "react";
import { formatDate, copyToClipboard } from "@/lib/utils";
import { useConfirm } from "./ConfirmDialog";

export default function ItemCard({ item, index, isAdmin, onClaim, onDelete, onDetail, addToast }) {
  const confirm = useConfirm();
  const isClaimed = item.status === "Claimed";
  const badgeClass =
    item.status === "Lost"
      ? "badge-lost"
      : item.status === "Found"
        ? "badge-found"
        : "badge-claimed";

  const imgSrc =
    item.image ||
    `https://placehold.co/400x200/e2e8f0/94a3b8?text=${encodeURIComponent(item.category)}`;

  const contactBtnRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleContact = useCallback(
    (e) => {
      e.stopPropagation();
      copyToClipboard(
        item.contact,
        `Copied: ${item.contact}`,
        contactBtnRef.current,
        addToast
      );
    },
    [item.contact, addToast]
  );

  const handleClaim = useCallback(
    async (e) => {
      e.stopPropagation();
      const ok = await confirm({
        icon: "✅",
        title: "Mark as Claimed",
        message: `Mark "${item.name}" as claimed/returned? This action indicates the item has been reunited with its owner.`,
        confirmText: "Yes, Mark Claimed",
        cancelText: "Cancel",
        variant: "claim",
      });
      if (ok) onClaim(item.id || item._id);
    },
    [item.id, item._id, item.name, onClaim, confirm]
  );

  const handleDelete = useCallback(
    async (e) => {
      e.stopPropagation();
      const ok = await confirm({
        icon: "🗑️",
        title: "Remove Item",
        message: `Permanently remove "${item.name}"? This action cannot be undone.`,
        confirmText: "Remove",
        cancelText: "Keep It",
        variant: "danger",
      });
      if (ok) onDelete(item.id || item._id);
    },
    [item.id, item._id, item.name, onDelete, confirm]
  );

  return (
    <div
      className={`item-card${isClaimed ? " claimed-card" : ""}`}
      style={{ animationDelay: `${index * 0.055}s` }}
      onClick={() => onDetail(item)}
    >
      <div className="card-img">
        <span className={`badge ${badgeClass}`}>{item.status}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={item.name}
          loading="lazy"
          className={imgLoaded ? "loaded" : "loading"}
          onLoad={() => setImgLoaded(true)}
        />
      </div>
      <div className="card-body">
        <span className="card-cat">{item.category}</span>
        <h3 className="card-title">{item.name}</h3>
        <div className="card-meta">
          <span>📍 {item.location}</span>
          <span>📅 {formatDate(item.date)}</span>
        </div>
        <p className="card-desc">{item.description || "No description."}</p>
        <div className="card-foot">
          <button
            ref={contactBtnRef}
            className="contact-btn"
            title="Copy contact info"
            aria-label={`Copy contact: ${item.contact}`}
            onClick={handleContact}
          >
            📩 Contact
          </button>

          {/* Claim available to everyone, Delete admin-only */}
          <div className="card-actions-right">
            {!isClaimed && (
              <button
                className="claim-btn"
                title="Mark as claimed"
                onClick={handleClaim}
              >
                ✅ Claimed
              </button>
            )}
            {isAdmin && (
              <button
                className="del-btn"
                title="Remove item"
                onClick={handleDelete}
              >
                🗑 Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
