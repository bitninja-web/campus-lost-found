// /* Full script: preloads demo items (if storage empty), multi-image add (max 4), compression,
//    search + filters + highlight, previews, localStorage handling with quota fallback.
//    Modal is scrollable and image preview area is horizontally scrollable. */
document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("searchBar");
  const filterCategory = document.getElementById("filterCategory");
  const filterLocation = document.getElementById("filterLocation");
  const filterDate = document.getElementById("filterDate");
  const itemsContainer = document.getElementById("itemsContainer");
  const openModalBtn = document.getElementById("openModal");
  const clearFiltersBtn = document.getElementById("clearFilters");
  const modal = document.getElementById("modal");
  const closeModalBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const itemForm = document.getElementById("itemForm");
  const itemImagesInput = document.getElementById("itemImages");
  const imagePreview = document.getElementById("imagePreview");

  const LS_KEY = "lostFoundItems_v2";
  const MAX_IMAGES = 4;
  const PLACEHOLDER_IMG =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%25' height='100%25' fill='%23efefef'/><text x='50%25' y='50%25' font-family='Arial' font-size='48' fill='%23999' text-anchor='middle' dominant-baseline='middle'>No%20Image</text></svg>";

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  function compressImage(file, maxWidth = 900, quality = 0.75) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e || new Error("Image load error"));
      };
      img.src = url;
    });
  }

  function loadItems() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to parse localStorage:", e);
    }

    const demo = [
      {
        id: "demo-1",
        name: "Black Leather Wallet",
        category: "Accessories",
        location: "Library, 2nd Floor",
        date: "2025-08-10",
        description: "Contains college ID and some cash. Wildcraft brand.",
        images: ["https://via.placeholder.com/300x200?text=Wallet"]
      },
      {
        id: "demo-2",
        name: "Silver Wrist Watch",
        category: "Accessories",
        location: "Cafeteria",
        date: "2025-08-08",
        description: "Titan analog watch with brown leather strap.",
        images: ["https://via.placeholder.com/300x200?text=Wrist+Watch"]
      },
      {
        id: "demo-3",
        name: "Mathematics Textbook",
        category: "Books",
        location: "Room 204, Main Building",
        date: "2025-08-07",
        description: "Higher Engineering Mathematics by B.S. Grewal (44th ed).",
        images: ["https://via.placeholder.com/300x200?text=Textbook"]
      },
      {
        id: "demo-4",
        name: "Samsung Galaxy Phone Back Case",
        category: "Electronics",
        location: "Auditorium",
        date: "2025-08-06",
        description: "Blue silicone case with small scratch near camera cutout.",
        images: ["https://via.placeholder.com/300x200?text=Phone+Case"]
      },
      {
        id: "demo-5",
        name: "Keychain with Car Keys",
        category: "Accessories",
        location: "Parking Lot B",
        date: "2025-08-05",
        description: "Black Honda key with metal keychain 'Best Dad'.",
        images: ["https://via.placeholder.com/300x200?text=Keys"]
      },
      {
        id: "demo-6",
        name: "Student ID Card",
        category: "Personal ID",
        location: "Sports Complex",
        date: "2025-08-04",
        description: "Blue lanyard college ID card (John Doe, CS).",
        images: ["https://via.placeholder.com/300x200?text=ID+Card"]
      }
    ];

    try { localStorage.setItem(LS_KEY, JSON.stringify(demo)); } catch (e) {}
    return demo;
  }

  function saveItems(items) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); return true; }
    catch (err) { console.warn("localStorage setItem failed:", err); return false; }
  }

  function escapeHtml(str = "") {
    return String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
  }

  function highlightText(text, safeQueryRegex) {
    if (!safeQueryRegex) return escapeHtml(text);
    const re = new RegExp(`(${safeQueryRegex})`, "gi");
    return escapeHtml(text).replace(re, "<span class='highlight'>$1</span>");
  }

  function renderItems() {
    const query = normalize(searchBar.value);
    const catFilter = normalize(filterCategory.value);
    const locFilter = normalize(filterLocation.value);
    const dateFilter = filterDate.value;

    itemsContainer.innerHTML = "";
    let foundAny = false;

    items.forEach((it) => {
      const matchSearch =
        !query ||
        normalize(it.name).includes(query) ||
        normalize(it.description).includes(query) ||
        normalize(it.location).includes(query) ||
        normalize(it.category).includes(query) ||
        (it.date && it.date.includes(query));

      const matchCat = !catFilter || normalize(it.category) === catFilter;
      const matchLoc = !locFilter || normalize(it.location).includes(locFilter);
      const matchDate = !dateFilter || (it.date === dateFilter);

      if (matchSearch && matchCat && matchLoc && matchDate) {
        foundAny = true;
        const card = document.createElement("article");
        card.className = "item";

        const imgs = it.images && it.images.length ? it.images : [PLACEHOLDER_IMG];
        const imagesHTML = imgs.slice(0, 3).map(src => `<img src="${src}" alt="${escapeHtml(it.name)}">`).join("");

        const safeQuery = query ? escapeRegExp(query) : null;
        const highlightedName = safeQuery ? highlightText(it.name, safeQuery) : escapeHtml(it.name);
        const highlightedDesc = safeQuery ? highlightText(it.description, safeQuery) : escapeHtml(it.description);

        card.innerHTML = `
          <div class="images">${imagesHTML}</div>
          <h3>${highlightedName}</h3>
          <p><strong>Category:</strong> ${escapeHtml(it.category)}</p>
          <p><strong>Location:</strong> ${escapeHtml(it.location)}</p>
          <p><strong>Date:</strong> ${escapeHtml(it.date)}</p>
          <p>${highlightedDesc}</p>
        `;
        itemsContainer.appendChild(card);
      }
    });

    if (!foundAny) {
      const no = document.createElement("div");
      no.style.gridColumn = "1/-1";
      no.style.textAlign = "center";
      no.style.color = "#777";
      no.textContent = "No matching items found.";
      itemsContainer.appendChild(no);
    }
  }

  let items = loadItems();
  renderItems();

  searchBar.addEventListener("input", renderItems);
  filterCategory.addEventListener("change", renderItems);
  filterLocation.addEventListener("input", renderItems);
  filterDate.addEventListener("change", renderItems);

  clearFiltersBtn.addEventListener("click", () => {
    searchBar.value = "";
    filterCategory.value = "";
    filterLocation.value = "";
    filterDate.value = "";
    renderItems();
  });

  function openModal() {
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("itemName").focus();
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    clearImagePreview();
    itemForm.reset();
    document.body.style.overflow = "";
  }

  openModalBtn.addEventListener("click", openModal);
  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  itemImagesInput.addEventListener("change", () => {
    clearImagePreview();
    const files = Array.from(itemImagesInput.files).slice(0, MAX_IMAGES);
    files.forEach((f) => {
      const url = URL.createObjectURL(f);
      const img = document.createElement("img");
      img.src = url;
      img.onload = () => URL.revokeObjectURL(url);
      imagePreview.appendChild(img);
    });
  });

  function clearImagePreview() { imagePreview.innerHTML = ""; }

  itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("itemName").value.trim();
    const category = document.getElementById("itemCategory").value.trim() || "Other";
    const location = document.getElementById("itemLocation").value.trim() || "Unknown";
    const date = document.getElementById("itemDate").value || "";
    const description = document.getElementById("itemDescription").value.trim();
    const files = Array.from(itemImagesInput.files || []).slice(0, MAX_IMAGES);

    let imagesData = [];
    try {
      if (files.length > 0) {
        const compressed = await Promise.all(files.map(f => compressImage(f, 900, 0.75)));
        imagesData = compressed;
      }
    } catch (err) {
      console.warn("Image compress failed:", err);
    }

    const newItem = {
      id: `id-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      name, category, location, date, description,
      images: imagesData.length ? imagesData : [PLACEHOLDER_IMG]
    };

    items.unshift(newItem);

    const saved = saveItems(items);
    if (!saved) {
      newItem.images = [PLACEHOLDER_IMG];
      items[0] = newItem;
      const saved2 = saveItems(items);
      if (!saved2) {
        alert("Unable to save item to local storage. Your browser storage may be full.");
      } else {
        alert("Image could not be saved due to storage limits — item saved with placeholder image.");
      }
    }

    renderItems();
    closeModal();
  });
});
