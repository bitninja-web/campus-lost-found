// ── Format date to readable string ──
export function formatDate(dateStr) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ── Copy to clipboard with visual feedback ──
export function copyToClipboard(text, successMsg, triggerEl, addToast) {
  const doAfterCopy = () => {
    if (addToast) addToast(successMsg, "success");
    if (triggerEl) {
      const originalHTML = triggerEl.innerHTML;
      const originalDisabled = triggerEl.disabled;
      triggerEl.innerHTML = "✓ Copied!";
      triggerEl.classList.add("copied-feedback");
      triggerEl.disabled = true;
      setTimeout(() => {
        triggerEl.innerHTML = originalHTML;
        triggerEl.classList.remove("copied-feedback");
        triggerEl.disabled = originalDisabled;
      }, 1800);
    }
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(doAfterCopy)
      .catch(() => fallbackCopy(text, successMsg, triggerEl, addToast));
  } else {
    fallbackCopy(text, successMsg, triggerEl, addToast);
  }
}

function fallbackCopy(text, successMsg, triggerEl, addToast) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    if (addToast) addToast(successMsg, "success");
    if (triggerEl) {
      const originalHTML = triggerEl.innerHTML;
      triggerEl.innerHTML = "✓ Copied!";
      triggerEl.classList.add("copied-feedback");
      setTimeout(() => {
        triggerEl.innerHTML = originalHTML;
        triggerEl.classList.remove("copied-feedback");
      }, 1800);
    }
  } catch {
    if (addToast) addToast("Contact: " + text, "info");
  }
  document.body.removeChild(ta);
}
