// ── Shared validation constants & helpers ──
// Used by both API routes to avoid duplication.

export const VALID_STATUSES = ["Lost", "Found", "Claimed"];

export const VALID_CATEGORIES = [
  "Electronics",
  "Accessories",
  "Books",
  "IDs & Cards",
  "Clothing",
  "Other",
];

/**
 * Sanitize a user-provided string: trim whitespace, cap length.
 */
export function sanitize(val, maxLen = 500) {
  return typeof val === "string" ? val.trim().slice(0, maxLen) : "";
}

/**
 * Strips audit fields for non-admin (student) responses.
 * Returns a plain object with `id` normalised from `_id`.
 */
export function stripAuditFields(item) {
  const obj = item.toObject ? item.toObject() : { ...item };
  obj.id = obj._id?.toString() || obj.id;
  delete obj.submittedBy;
  delete obj.submittedAt;
  delete obj.claimedBy;
  delete obj.handedOverAt;
  delete obj.statusHistory;
  delete obj.__v;
  return obj;
}

/**
 * Returns the full item with audit data for admin responses.
 * Returns a plain object with `id` normalised from `_id`.
 */
export function fullItem(item) {
  const obj = item.toObject ? item.toObject() : { ...item };
  obj.id = obj._id?.toString() || obj.id;
  delete obj.__v;
  return obj;
}
