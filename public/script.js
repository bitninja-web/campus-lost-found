document.addEventListener("DOMContentLoaded", () => {

  // ── DOM Refs ──
  const container     = document.getElementById("itemsContainer");
  const loader        = document.getElementById("loader");
  const noResults     = document.getElementById("noResults");
  const searchBar     = document.getElementById("searchBar");
  const filterCat     = document.getElementById("filterCategory");
  const sortSelect    = document.getElementById("sortSelect");
  const modalEl       = document.getElementById("modal");
  const openBtn       = document.getElementById("openModal");
  const closeBtn      = document.getElementById("closeModal");
  const form          = document.getElementById("itemForm");
  const submitBtn     = document.getElementById("submitBtn");
  const submitText    = document.getElementById("submitBtnText");
  const submitSpinner = document.getElementById("submitSpinner");
  const imageInput    = document.getElementById("itemImages");
  const imgPreview    = document.getElementById("imagePreview");
  const clearImgBtn   = document.getElementById("clearImage");
  const toastBox      = document.getElementById("toastBox");
  const detailView    = document.getElementById("detailView");
  const statsBar      = document.getElementById("statsBar");
  const themeToggle   = document.getElementById("themeToggle");
  const scrollTop     = document.getElementById("scrollTop");
  const toolbar       = document.getElementById("toolbar");
  const uploadArea    = document.getElementById("uploadArea");
  const descTA        = document.getElementById("itemDescription");
  const charCount     = document.getElementById("charCount");
  const tabBtns       = document.querySelectorAll(".tab-btn");

  const API = "/api/items";
  let allItems = [];
  let activeStatus = "";   // "" | "Lost" | "Found" | "Claimed"
  let searchDebounceTimer;

  // ── Init ──
  initTheme();
  loadItems();
  bindEvents();

  // ─────────────────────────────────────────────
  //  EVENTS
  // ─────────────────────────────────────────────
  function bindEvents() {
    // Search with debounce
    searchBar.addEventListener("input", () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(applyFilter, 220);
    });

    filterCat.addEventListener("change", applyFilter);
    sortSelect.addEventListener("change", applyFilter);

    // Status tabs
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeStatus = btn.dataset.status;
        applyFilter();
      });
    });

    // Modal
    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    modalEl.addEventListener("click", e => { if (e.target === modalEl) closeModal(); });

    // Form
    form.addEventListener("submit", submitForm);
    imageInput.addEventListener("change", previewImage);
    clearImgBtn.addEventListener("click", resetPreview);

    // Char count for description
    descTA.addEventListener("input", updateCharCount);

    // Drag and drop
    bindDragDrop();

    // Keyboard: Esc closes modal or detail view
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        if (!modalEl.classList.contains("hidden")) closeModal();
        else if (!detailView.classList.contains("hidden")) closeDetail();
      }
    });

    // Inline validation on blur
    ["itemName", "itemContact", "itemLocation"].forEach(id => {
      document.getElementById(id).addEventListener("blur", () => validateField(id));
    });

    // Theme toggle
    themeToggle.addEventListener("click", toggleTheme);

    // Scroll to top
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        scrollTop.classList.remove("hidden");
        scrollTop.classList.add("show");
      } else {
        scrollTop.classList.add("hidden");
        scrollTop.classList.remove("show");
      }
    });

    scrollTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ─────────────────────────────────────────────
  //  THEME
  // ─────────────────────────────────────────────
  function initTheme() {
    const saved = localStorage.getItem("cr-theme") || "light";
    applyTheme(saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cr-theme", theme);
    const icon = document.querySelector(".theme-icon");
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  // ─────────────────────────────────────────────
  //  LOAD ITEMS
  // ─────────────────────────────────────────────
  async function loadItems() {
    showLoader(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Server error");
      allItems = await res.json();
    } catch {
      toast("Failed to load items. Is the server running?", "error");
    } finally {
      showLoader(false);
      applyFilter();
      updateStats();
    }
  }

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  function renderItems(items) {
    container.innerHTML = "";
    if (items.length === 0) {
      noResults.classList.remove("hidden");
      return;
    }
    noResults.classList.add("hidden");

    items.forEach((item, index) => {
      const card = document.createElement("div");
      const isClaimed = item.status === "Claimed";
      card.className = `item-card${isClaimed ? " claimed-card" : ""}`;
      card.style.animationDelay = `${index * 0.055}s`;

      const badgeClass = item.status === "Lost"
        ? "badge-lost"
        : item.status === "Found"
          ? "badge-found"
          : "badge-claimed";

      const imgSrc = item.image
        || `https://placehold.co/400x200/e2e8f0/94a3b8?text=${encodeURIComponent(item.category)}`;

      card.innerHTML = `
        <div class="card-img">
          <span class="badge ${badgeClass}">${item.status}</span>
          <img src="${escHtml(imgSrc)}" alt="${escHtml(item.name)}" loading="lazy">
        </div>
        <div class="card-body">
          <span class="card-cat">${escHtml(item.category)}</span>
          <h3 class="card-title">${escHtml(item.name)}</h3>
          <div class="card-meta">
            <span>📍 ${escHtml(item.location)}</span>
            <span>📅 ${formatDate(item.date)}</span>
          </div>
          <p class="card-desc">${escHtml(item.description || "No description.")}</p>
          <div class="card-foot">
            <button class="contact-btn" title="Copy contact info" aria-label="Copy contact: ${escHtml(item.contact)}">📩 Contact</button>
            <div class="card-actions-right">
              ${!isClaimed ? `<button class="claim-btn" title="Mark as claimed">✅ Claimed</button>` : ""}
              <button class="del-btn" title="Remove item">🗑 Remove</button>
            </div>
          </div>
        </div>
      `;

      // ── Contact: copy with visual feedback ──
      const contactBtnEl = card.querySelector(".contact-btn");
      contactBtnEl.addEventListener("click", e => {
        e.stopPropagation();
        copyToClipboard(item.contact, `Copied: ${item.contact}`, contactBtnEl);
      });

      // ── Claim ──
      const claimBtnEl = card.querySelector(".claim-btn");
      if (claimBtnEl) {
        claimBtnEl.addEventListener("click", e => {
          e.stopPropagation();
          claimItem(item.id);
        });
      }

      // ── Delete ──
      card.querySelector(".del-btn").addEventListener("click", e => {
        e.stopPropagation();
        deleteItem(item.id);
      });

      // ── Card click → detail view ──
      card.addEventListener("click", () => showDetail(item));

      container.appendChild(card);
    });
  }

  // ─────────────────────────────────────────────
  //  FILTER + SORT
  // ─────────────────────────────────────────────
  function applyFilter() {
    const q      = searchBar.value.toLowerCase().trim();
    const cat    = filterCat.value;
    const sortVal = sortSelect.value;

    let filtered = allItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);

      const matchesCat    = !cat || item.category === cat;
      const matchesStatus = !activeStatus || item.status === activeStatus;
      return matchesSearch && matchesCat && matchesStatus;
    });

    filtered = sortItems(filtered, sortVal);
    renderItems(filtered);
  }

  function sortItems(items, mode) {
    const arr = [...items];
    switch (mode) {
      case "newest": return arr.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "oldest": return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "az":     return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "za":     return arr.sort((a, b) => b.name.localeCompare(a.name));
      default: return arr;
    }
  }

  // ─────────────────────────────────────────────
  //  RESET FILTERS — exposed globally for inline onclick
  // ─────────────────────────────────────────────
  window.resetFilters = function () {
    searchBar.value    = "";
    filterCat.value    = "";
    sortSelect.value   = "newest";
    activeStatus       = "";
    tabBtns.forEach(b => b.classList.remove("active"));
    tabBtns[0].classList.add("active");
    applyFilter();
  };

  // ─────────────────────────────────────────────
  //  STATS
  // ─────────────────────────────────────────────
  function updateStats() {
    const lost    = allItems.filter(i => i.status === "Lost").length;
    const found   = allItems.filter(i => i.status === "Found").length;
    const claimed = allItems.filter(i => i.status === "Claimed").length;
    statsBar.innerHTML = `
      <div class="stat"><span class="stat-num">${allItems.length}</span><span class="stat-label">Total</span></div>
      <div class="stat"><span class="stat-num stat-lost">${lost}</span><span class="stat-label">Lost</span></div>
      <div class="stat"><span class="stat-num stat-found">${found}</span><span class="stat-label">Found</span></div>
      <div class="stat"><span class="stat-num stat-claimed">${claimed}</span><span class="stat-label">Claimed</span></div>
    `;
  }

  // ─────────────────────────────────────────────
  //  CLAIM ITEM
  // ─────────────────────────────────────────────
  async function claimItem(id) {
    if (!confirm("Mark this item as claimed/returned?")) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Claimed" })
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      allItems = allItems.map(i => i.id == id ? updated : i);
      applyFilter();
      updateStats();
      toast("Item marked as claimed! 🎉", "success");
    } catch {
      toast("Could not update item.", "error");
    }
  }

  // ─────────────────────────────────────────────
  //  DELETE
  // ─────────────────────────────────────────────
  async function deleteItem(id) {
    if (!confirm("Permanently remove this item?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      allItems = allItems.filter(i => i.id != id);
      applyFilter();
      updateStats();
      toast("Item removed.", "info");
    } catch {
      toast("Delete failed.", "error");
    }
  }

  // ─────────────────────────────────────────────
  //  FORM + VALIDATION
  // ─────────────────────────────────────────────
  function validateField(id) {
    const el  = document.getElementById(id);
    const err = document.getElementById(`err-${id}`);
    if (!el || !err) return true;
    const val = el.value.trim();
    let msg = "";

    if (!val) {
      msg = "This field is required.";
    } else if (id === "itemContact") {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const phoneOk = /^[\d\s+\-()\u0900-\u097F]{7,15}$/.test(val);
      if (!emailOk && !phoneOk) msg = "Enter a valid email or phone number.";
    }

    if (msg) {
      el.classList.add("invalid");
      err.textContent = msg;
      return false;
    } else {
      el.classList.remove("invalid");
      err.textContent = "";
      return true;
    }
  }

  function validateForm() {
    const fields = ["itemName", "itemContact", "itemLocation"];
    let ok = true;
    fields.forEach(id => { if (!validateField(id)) ok = false; });
    return ok;
  }

  function clearValidation() {
    ["itemName", "itemContact", "itemLocation"].forEach(id => {
      const el = document.getElementById(id);
      const er = document.getElementById(`err-${id}`);
      if (el) el.classList.remove("invalid");
      if (er) er.textContent = "";
    });
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!validateForm()) {
      toast("Please fix the errors above.", "error");
      return;
    }

    submitText.textContent = "Submitting...";
    submitSpinner.classList.remove("hidden");
    submitBtn.disabled = true;

    // Use FormData so image is sent as a real file, not base64
    const formData = new FormData();
    formData.append("name",        document.getElementById("itemName").value.trim());
    formData.append("status",      document.getElementById("itemStatus").value);
    formData.append("category",    document.getElementById("itemCategory").value);
    formData.append("location",    document.getElementById("itemLocation").value.trim());
    formData.append("date",        document.getElementById("itemDate").value);
    formData.append("contact",     document.getElementById("itemContact").value.trim());
    formData.append("description", descTA.value.trim());

    const file = imageInput.files[0];
    if (file) formData.append("image", file);

    try {
      // No "Content-Type" header — browser sets it automatically with boundary for FormData
      const res = await fetch(API, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      allItems.unshift(saved);
      applyFilter();
      updateStats();
      closeModal();
      form.reset();
      resetPreview();
      clearValidation();
      updateCharCount();
      toast("Report posted successfully! ✅", "success");
    } catch {
      toast("Failed to post. Please try again.", "error");
    } finally {
      submitText.textContent = "Submit Report";
      submitSpinner.classList.add("hidden");
      submitBtn.disabled = false;
    }
  }

  // ─────────────────────────────────────────────
  //  IMAGE / DRAG & DROP
  // ─────────────────────────────────────────────
  function bindDragDrop() {
    uploadArea.addEventListener("dragover", e => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", e => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleImageFile(file);
      } else {
        toast("Please drop a valid image file.", "error");
      }
    });
  }

  function previewImage(e) {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  }

  function handleImageFile(file) {
    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be under 5 MB.", "error");
      imageInput.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      imgPreview.style.backgroundImage = `url('${ev.target.result}')`;
      imgPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }

  function resetPreview() {
    imgPreview.style.backgroundImage = "";
    imgPreview.classList.add("hidden");
    imageInput.value = "";
  }

  // ─────────────────────────────────────────────
  //  CHAR COUNT
  // ─────────────────────────────────────────────
  function updateCharCount() {
    const len = descTA.value.length;
    const max = 300;
    charCount.textContent = `${len} / ${max}`;
    charCount.classList.remove("warn", "over");
    if (len > max * 0.85) charCount.classList.add("warn");
    if (len >= max)       charCount.classList.add("over");
  }

  // ─────────────────────────────────────────────
  //  MODAL
  // ─────────────────────────────────────────────
  function openModal() {
    modalEl.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    const dateField = document.getElementById("itemDate");
    if (dateField && !dateField.value) {
      dateField.value = new Date().toISOString().split("T")[0];
    }
    setTimeout(() => document.getElementById("itemName").focus(), 100);
  }

  function closeModal() {
    modalEl.classList.add("hidden");
    document.body.style.overflow = "";
  }

  // ─────────────────────────────────────────────
  //  LOADER
  // ─────────────────────────────────────────────
  function showLoader(show) {
    loader.classList.toggle("hidden", !show);
    if (show) {
      container.classList.add("hidden");
      toolbar.classList.add("hidden");
    } else {
      container.classList.remove("hidden");
      toolbar.classList.remove("hidden");
    }
  }

  // ─────────────────────────────────────────────
  //  DETAIL VIEW
  // ─────────────────────────────────────────────
  function showDetail(item) {
    const isClaimed = item.status === "Claimed";
    const badgeClass = item.status === "Lost"
      ? "badge-lost"
      : item.status === "Found"
        ? "badge-found"
        : "badge-claimed";

    const imgSrc = item.image
      || `https://placehold.co/800x500/e2e8f0/94a3b8?text=${encodeURIComponent(item.category)}`;

    detailView.innerHTML = `
      <div class="detail-panel" id="detailPanel">
        <button class="detail-close-btn" id="closeDetail" title="Close" aria-label="Close detail">✕</button>

        <div class="detail-hero" style="--hero-img-url: url('${escHtml(imgSrc)}')">
          <span class="badge ${badgeClass}">${item.status}</span>
          <img src="${escHtml(imgSrc)}" alt="${escHtml(item.name)}">
        </div>

        <div class="detail-body">
          <div class="detail-cat">${escHtml(item.category)}</div>
          <h2 class="detail-title">${escHtml(item.name)}</h2>

          <div class="detail-chips">
            <span class="detail-chip">📍 <strong>${escHtml(item.location)}</strong></span>
            <span class="detail-chip">📅 <strong>${formatDate(item.date)}</strong></span>
            <span class="detail-chip chip-contact" id="detailContact" title="Click to copy contact" role="button" tabindex="0" aria-label="Copy contact: ${escHtml(item.contact)}">
              📩 ${escHtml(item.contact)}
            </span>
          </div>

          <div class="detail-desc-label">Description</div>
          <p class="detail-desc">${escHtml(item.description || "No description provided.")}</p>

          <div class="detail-actions">
            <button class="btn btn-primary" id="detailContactBtn">📩 Copy Contact</button>
            ${!isClaimed ? `<button class="claim-btn" id="detailClaim">✅ Mark as Claimed</button>` : ""}
            <button class="del-btn" id="detailDelete">🗑 Remove Item</button>
          </div>
        </div>
      </div>
    `;

    detailView.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Backdrop click — delay slightly so originating card-click doesn't immediately close
    setTimeout(() => {
      detailView.addEventListener("click", handleDetailBackdrop);
    }, 150);

    document.getElementById("closeDetail").addEventListener("click", closeDetail);

    // ── Contact chip click ──
    const detailContactChip = document.getElementById("detailContact");
    detailContactChip.addEventListener("click", () => {
      copyToClipboard(item.contact, `Copied: ${item.contact}`, detailContactChip);
    });
    // Keyboard accessible
    detailContactChip.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copyToClipboard(item.contact, `Copied: ${item.contact}`, detailContactChip);
      }
    });

    // ── Copy Contact button ──
    const detailContactBtn = document.getElementById("detailContactBtn");
    detailContactBtn.addEventListener("click", () => {
      copyToClipboard(item.contact, `Copied: ${item.contact}`, detailContactBtn);
    });

    // ── Claim ──
    const detailClaim = document.getElementById("detailClaim");
    if (detailClaim) {
      detailClaim.addEventListener("click", () => {
        claimItem(item.id);
        closeDetail();
      });
    }

    // ── Delete ──
    document.getElementById("detailDelete").addEventListener("click", () => {
      if (confirm("Permanently remove this item?")) {
        deleteItem(item.id);
        closeDetail();
      }
    });
  }

  function handleDetailBackdrop(e) {
    if (e.target === detailView) closeDetail();
  }

  function closeDetail() {
    // Remove backdrop listener to avoid stacking
    detailView.removeEventListener("click", handleDetailBackdrop);

    const panel = document.getElementById("detailPanel");
    if (panel) {
      panel.style.transition = "opacity .2s ease, transform .2s ease";
      panel.style.opacity    = "0";
      panel.style.transform  = "scale(.96) translateY(16px)";
    }
    detailView.style.transition = "opacity .22s ease";
    detailView.style.opacity    = "0";

    setTimeout(() => {
      detailView.classList.add("hidden");
      detailView.innerHTML    = "";
      detailView.style.opacity  = "";
      detailView.style.transition = "";
      document.body.style.overflow = "";
    }, 220);
  }

  // ─────────────────────────────────────────────
  //  COPY TO CLIPBOARD — with visual feedback on button
  // ─────────────────────────────────────────────
  function copyToClipboard(text, successMsg, triggerEl) {
    const doAfterCopy = () => {
      toast(successMsg, "success");
      // Visual feedback on the triggering element
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
      navigator.clipboard.writeText(text)
        .then(doAfterCopy)
        .catch(() => fallbackCopy(text, successMsg, triggerEl));
    } else {
      fallbackCopy(text, successMsg, triggerEl);
    }
  }

  function fallbackCopy(text, successMsg, triggerEl) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast(successMsg, "success");
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
      toast("Contact: " + text, "info");
    }
    document.body.removeChild(ta);
  }

  // ─────────────────────────────────────────────
  //  UTILS
  // ─────────────────────────────────────────────
  function formatDate(dateStr) {
    try {
      return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });
    } catch {
      return dateStr;
    }
  }

  function escHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ─────────────────────────────────────────────
  //  TOAST — fully functional, type-styled, auto-dismiss
  // ─────────────────────────────────────────────
  function toast(msg, type = "success") {
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.setAttribute("role", "alert");
    t.innerHTML = `
      <span class="toast-icon">${icons[type] || "ℹ️"}</span>
      <span class="toast-msg">${escHtml(msg)}</span>
      <button class="toast-close" aria-label="Dismiss">✕</button>
    `;

    // Manual dismiss
    t.querySelector(".toast-close").addEventListener("click", () => dismissToast(t));

    toastBox.appendChild(t);

    // Auto-dismiss after 3.5 s
    setTimeout(() => dismissToast(t), 3500);
  }

  function dismissToast(t) {
    if (!t || !t.parentNode) return;
    t.style.opacity   = "0";
    t.style.transform = "translateX(30px)";
    setTimeout(() => t.remove(), 350);
  }

});