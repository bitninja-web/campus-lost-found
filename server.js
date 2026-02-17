const express = require("express");
const fs      = require("fs");
const path    = require("path");
const cors    = require("cors");
const multer  = require("multer");

const app         = express();
const PORT        = process.env.PORT || 5000;
const DATA_FILE   = path.join(__dirname, "items.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// ── Multer config: save files to /uploads with original extension ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  }
});

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: "1mb" }));           // no more giant base64
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOADS_DIR));  // serve uploaded images

// ─────────────────────────────────────────────
//  File Helpers
// ─────────────────────────────────────────────
function readItems() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

// ─────────────────────────────────────────────
//  Seed Data
// ─────────────────────────────────────────────
const SEED_DATA = [
  {
    id: 1,
    name: "Blue Water Bottle",
    status: "Found",
    category: "Accessories",
    location: "Library Hall A",
    description: "Milton brand, 1 liter bottle with a sticker on the side.",
    contact: "9876543210",
    date: "2026-02-15",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=200&fit=crop"
  },
  {
    id: 2,
    name: "Scientific Calculator",
    status: "Lost",
    category: "Electronics",
    location: "Lab 302",
    description: "Casio FX-991EX. Has a name tag 'Rahul' on the back.",
    contact: "rahul@campus.edu",
    date: "2026-02-14",
    image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=200&fit=crop"
  },
  {
    id: 3,
    name: "Data Structures Textbook",
    status: "Found",
    category: "Books",
    location: "Seminar Hall B",
    description: "By Cormen (CLRS), 3rd edition. Dog-eared pages, highlighted chapters 4-8.",
    contact: "librarydesk@campus.edu",
    date: "2026-02-13",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=200&fit=crop"
  },
  {
    id: 4,
    name: "Student ID Card",
    status: "Lost",
    category: "IDs & Cards",
    location: "Main Canteen",
    description: "University ID for Priya Sharma, Roll No. 22CS104. Blue lanyard attached.",
    contact: "priya.s@campus.edu",
    date: "2026-02-12",
    image: "https://images.unsplash.com/photo-1578670812003-60745e2c2ea9?w=400&h=200&fit=crop"
  },
  {
    id: 5,
    name: "Black Denim Jacket",
    status: "Found",
    category: "Clothing",
    location: "Auditorium, Row 12",
    description: "Men's medium-sized black denim jacket. Zara brand. Left after cultural fest.",
    contact: "9988776655",
    date: "2026-02-11",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=200&fit=crop"
  },
  {
    id: 6,
    name: "Umbrella (Transparent)",
    status: "Lost",
    category: "Other",
    location: "Parking Lot Gate 2",
    description: "Transparent dome-shaped umbrella with a wooden handle. Sentimental value.",
    contact: "amit.k@campus.edu",
    date: "2026-02-10",
    image: "https://images.unsplash.com/photo-1534309466160-70b22cc6254b?w=400&h=200&fit=crop"
  }
];

function initializeData() {
  const items = readItems();
  if (items.length === 0) {
    writeItems(SEED_DATA);
    console.log("✅ Seeded initial data.");
  }
}

// ─────────────────────────────────────────────
//  Validation Helper
// ─────────────────────────────────────────────
const VALID_STATUSES   = ["Lost", "Found", "Claimed"];
const VALID_CATEGORIES = ["Electronics", "Accessories", "Books", "IDs & Cards", "Clothing", "Other"];

function sanitizeString(val) {
  return typeof val === "string" ? val.trim().slice(0, 500) : "";
}

// ─────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────

// GET /api/items — all items (optional ?status= or ?category= filter)
app.get("/api/items", (req, res) => {
  try {
    let items = readItems();

    // Optional server-side filters
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      items = items.filter(i => i.status === req.query.status);
    }
    if (req.query.category && VALID_CATEGORIES.includes(req.query.category)) {
      items = items.filter(i => i.category === req.query.category);
    }

    res.json(items);
  } catch (err) {
    console.error("GET /api/items error:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// GET /api/items/:id — single item
app.get("/api/items/:id", (req, res) => {
  try {
    const items = readItems();
    const item  = items.find(i => i.id == req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error("GET /api/items/:id error:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// POST /api/items — create new item (multipart/form-data with optional image file)
app.post("/api/items", upload.single("image"), (req, res) => {
  try {
    const { name, status, category, location, contact, date, description } = req.body;

    // Required field validation
    if (!name || !status || !category || !location || !contact || !date) {
      // Clean up uploaded file if validation fails
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Missing required fields: name, status, category, location, contact, date" });
    }

    if (!VALID_STATUSES.includes(status)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` });
    }

    // Date validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Date must be in YYYY-MM-DD format" });
    }

    // Build image URL: use uploaded file path, or empty string
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const items = readItems();
    const newItem = {
      id:          Date.now(),
      name:        sanitizeString(name).slice(0, 80),
      status,
      category,
      location:    sanitizeString(location).slice(0, 100),
      contact:     sanitizeString(contact).slice(0, 100),
      date,
      description: sanitizeString(description).slice(0, 300),
      image:       imageUrl
    };

    items.unshift(newItem);
    writeItems(items);
    res.status(201).json(newItem);
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error("POST /api/items error:", err);
    res.status(500).json({ error: "Failed to save item" });
  }
});

// PATCH /api/items/:id — update item fields (e.g. mark as claimed)
app.patch("/api/items/:id", (req, res) => {
  try {
    const items = readItems();
    const idx   = items.findIndex(i => i.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Item not found" });

    const allowed = ["status", "name", "description", "location", "contact", "date", "category"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Validate status if being changed
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    items[idx] = { ...items[idx], ...updates };
    writeItems(items);
    res.json(items[idx]);
  } catch (err) {
    console.error("PATCH /api/items/:id error:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE /api/items/:id — remove item
app.delete("/api/items/:id", (req, res) => {
  try {
    let items  = readItems();
    const before = items.length;
    items = items.filter(i => i.id != req.params.id);
    if (items.length === before) {
      return res.status(404).json({ error: "Item not found" });
    }
    writeItems(items);
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/items/:id error:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// ── Multer error handler ──
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === "Only image files are allowed") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// ── 404 fallback for API ──
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// ─────────────────────────────────────────────
//  Start
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  initializeData();
  console.log(`\n🚀 Campus Retriever server running at http://localhost:${PORT}`);
  console.log(`📂 Data file: ${DATA_FILE}\n`);
});