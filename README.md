# 🎒 Campus Lost & Found System

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Status](https://img.shields.io/badge/Status-Live-success)

A full-stack web application built with **Next.js** that enables students to report lost items and post found items within a campus.  
The system allows users to upload images, browse listings, and manage reports efficiently.

---

## ✨ Key Features

- 📝 Report Lost / Found Items with image upload
- 🖼️ Drag & Drop Image Upload Support
- 📋 Browse All Listings with search, filter & sort
- 🔍 Real-time Debounced Search
- 📂 Category & Status Filtering
- ✅ Mark Items as Claimed
- 🌙 Dark / Light Theme Toggle
- 📱 Fully Responsive Design
- 💾 Persistent Data Storage (JSON-based)
- 🔔 Toast Notifications

---

## 🏗️ Tech Stack

### 🔹 Frontend
- **Next.js 15** (App Router)
- **React 19**
- Vanilla CSS (1300+ lines with dark mode, animations, responsive breakpoints)

### 🔹 Backend
- **Next.js API Routes** (Route Handlers)
- Native `FormData` API for image uploads

### 🔹 Storage
- JSON File (`items.json`)
- Local Uploads Directory (`public/uploads/`)

---

## 📁 Project Structure

```
Campus_Lost&Found/
├── public/
│   └── uploads/              # Uploaded item images
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── items/
│   │   │       ├── route.js          # GET (list) + POST (create)
│   │   │       └── [id]/
│   │   │           └── route.js      # GET + PATCH + DELETE
│   │   ├── globals.css               # All styles
│   │   ├── layout.js                 # Root layout with providers
│   │   └── page.js                   # Main page
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── StatsBar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Toolbar.jsx
│   │   ├── ItemsGrid.jsx
│   │   ├── ItemCard.jsx
│   │   ├── DetailView.jsx
│   │   ├── ReportModal.jsx
│   │   ├── Toast.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── SkeletonLoader.jsx
│   │   └── Footer.jsx
│   ├── context/
│   │   ├── ThemeContext.jsx          # Dark/Light theme
│   │   └── ItemsContext.jsx          # Items state & CRUD
│   └── lib/
│       ├── items.js                  # Server-side helpers
│       └── utils.js                  # Client-side utilities
├── items.json                        # Data store
├── next.config.mjs
├── jsconfig.json
├── package.json
└── README.md
```

---

## ⚙️ Installation & Local Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/campus-lost-found.git
cd campus-lost-found
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Start Development Server

```bash
node ./node_modules/next/dist/bin/next dev
```

> ⚠️ **Note:** If your folder name contains special characters like `&` (e.g. `Campus_Lost&Found`), use the command above instead of `npm run dev`. Alternatively, rename the folder to remove the `&` and `npm run dev` will work normally.

### 4️⃣ Open in Browser

```
http://localhost:3000
```

---

## 🏭 Production Build

```bash
# Build
node ./node_modules/next/dist/bin/next build

# Start production server
node ./node_modules/next/dist/bin/next start
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/items` | List all items (supports `?status=` & `?category=` filters) |
| `GET` | `/api/items/:id` | Get a single item |
| `POST` | `/api/items` | Create new item (multipart form with optional image) |
| `PATCH` | `/api/items/:id` | Update item fields (e.g. mark as claimed) |
| `DELETE` | `/api/items/:id` | Remove an item |

---

## 🔄 Application Workflow

1. User submits a lost/found item via the report modal.
2. Image is uploaded via native FormData API and saved to `public/uploads/`.
3. Item details are stored in `items.json`.
4. React frontend fetches and dynamically displays the items.
5. Users can search, filter, sort, claim, or delete items.

---

## 📸 Screenshots

### Light Mode
<img width="1120" alt="Light Mode" src="https://github.com/user-attachments/assets/cc99f2c0-3ca9-40d7-bab0-b86caa3ef594" />

---

## 🚀 Future Improvements

- 🔄 MongoDB / PostgreSQL Integration
- ☁️ Cloudinary Image Storage
- 🔐 User Authentication (NextAuth.js)
- 📧 Email Notifications
- 🔎 Advanced Search with fuzzy matching

---

## 👨‍💻 Author

**Arpit**  
Full Stack Developer (Beginner → Growing 🚀)

---

## 📜 License

This project is built for educational and learning purposes.
