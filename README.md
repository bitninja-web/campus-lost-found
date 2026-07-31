# 🔍 Campus Retriever — Lost & Found System

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![NextAuth](https://img.shields.io/badge/Auth-NextAuth.js-purple)
![Status](https://img.shields.io/badge/Status-Live-success)

A full-stack **Next.js 15 (App Router)** application that lets students and admins report, browse, and reclaim lost or found items on campus. The app is authenticated end-to-end, stores all data in **MongoDB**, keeps images in the database itself (no filesystem uploads), and maintains a full audit trail of who reported and who claimed every item.

> This is a v2 rewrite of the original JSON-file-based prototype — the whole data layer has moved to MongoDB with real authentication and role-based access control (see [What Changed](#-what-changed-since-v1) below).

---

## ✨ Key Features

- 🔐 **Authentication** — Email/password login via NextAuth.js (Credentials provider), JWT sessions, route protection via middleware
- 👥 **Role-Based Access** — `student` and `admin` roles with different permissions
- 📝 **Report Lost / Found Items** with image upload (multipart `FormData`)
- 🖼️ **Database-Backed Images** — uploaded photos are stored as binary data in MongoDB and streamed back via a dedicated API route (no `public/uploads` folder needed)
- 📋 **Browse All Listings** with live search, category filter, status filter & sorting
- 🔍 Search across item name, location, description, and category
- ✅ **Claim Items** — any signed-in user can mark an item as `Claimed`
- 🕵️ **Full Audit Trail** — every status change is logged with who changed it, when, and why; visible to admins in the item detail view
- 🛡️ **Admin Controls** — admins can edit any item field, delete items, and see submitter/claimer identity (students see a stripped-down view without personal audit data)
- 🌙 **Dark / Light Theme Toggle**
- 📱 **Fully Responsive Design**
- 🔔 **Toast Notifications** for success/error feedback
- ⚠️ **Error Boundary & Confirm Dialogs** for safer destructive actions (e.g. deleting an item)
- 🌱 **Database Seeding Endpoint** to quickly spin up demo admin/student accounts

---

## 🏗️ Tech Stack

### 🔹 Frontend
- **Next.js 15** (App Router, Client Components)
- **React 19**
- Vanilla CSS (`globals.css`) — dark mode, animations, responsive breakpoints
- React Context for state: `ThemeContext`, `ItemsContext`, `AuthContext`

### 🔹 Backend
- **Next.js API Routes** (Route Handlers) under `src/app/api`
- **NextAuth.js** (`next-auth`) — Credentials provider, JWT sessions
- **bcryptjs** — password hashing
- Native `FormData` API for image uploads

### 🔹 Database
- **MongoDB** via **Mongoose** — one database, three collections:
  - `User` — accounts, hashed passwords, roles
  - `Item` — lost/found reports, status, category, audit trail
  - `Image` — binary image data + content type (images are served from Mongo, not disk)
- `mongodb-memory-server` available as a dev dependency for local/in-memory testing without a real Atlas cluster

---

## 📁 Project Structure

```
Campus_LostandFound/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.js   # NextAuth handler (GET + POST)
│   │   │   ├── items/
│   │   │   │   ├── route.js                  # GET (list, filtered) + POST (create)
│   │   │   │   └── [id]/route.js             # GET + PATCH (claim/edit) + DELETE (admin)
│   │   │   ├── images/[id]/route.js          # GET (stream image) + DELETE (admin)
│   │   │   └── seed/route.js                 # GET — seeds demo admin/student users
│   │   ├── login/page.js                     # Login screen (role-aware demo fill-in)
│   │   ├── globals.css                       # All styles
│   │   ├── layout.js                         # Root layout + providers + metadata
│   │   └── page.js                           # Main dashboard page
│   ├── components/
│   │   ├── Navbar.jsx            # Role badge, theme toggle, report button, logout
│   │   ├── Hero.jsx
│   │   ├── StatsBar.jsx          # Total / Lost / Found / Claimed counters
│   │   ├── SearchBar.jsx         # Debounced search input
│   │   ├── Toolbar.jsx           # Status/category filters + sort
│   │   ├── ItemsGrid.jsx
│   │   ├── ItemCard.jsx
│   │   ├── DetailView.jsx        # Full item view incl. audit trail (admin only)
│   │   ├── ReportModal.jsx       # Report Lost/Found form with drag & drop upload
│   │   ├── ConfirmDialog.jsx     # Confirmation dialog provider for destructive actions
│   │   ├── ErrorBoundary.jsx
│   │   ├── Toast.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── SkeletonLoader.jsx
│   │   └── Footer.jsx
│   ├── context/
│   │   ├── ThemeContext.jsx      # Dark/Light theme
│   │   ├── ItemsContext.jsx      # Items state, filtering/sorting, CRUD, toasts
│   │   └── AuthContext.jsx       # Wraps NextAuth's SessionProvider
│   ├── lib/
│   │   ├── mongodb.js            # Cached Mongoose connection helper
│   │   ├── auth.js               # NextAuth authOptions (Credentials provider, callbacks)
│   │   └── utils.js              # Client-side utilities
│   ├── models/
│   │   ├── User.js               # name, email, hashed password, role
│   │   ├── Item.js               # item fields + submittedBy/claimedBy/statusHistory
│   │   └── Image.js              # binary image storage (data, contentType, filename)
│   └── middleware.js             # Protects all routes except /login, /api/auth, /api/seed
├── .env.local                    # NEXTAUTH_URL, NEXTAUTH_SECRET, MONGODB_URI
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

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the project root with:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string
MONGODB_URI=mongodb://127.0.0.1:27017/campus_retriever
```

- `NEXTAUTH_SECRET` — any long random string (used to sign JWTs). Generate one with `openssl rand -base64 32`.
- `MONGODB_URI` — point this at a local MongoDB instance or a MongoDB Atlas cluster. If omitted, it defaults to `mongodb://127.0.0.1:27017/campus_retriever`.

### 4️⃣ Start Development Server

```bash
npm run dev
```

> ⚠️ **Note:** If your folder name contains special characters like `&`, some shells mishandle `npm run dev`. Rename the folder (e.g. to `Campus_LostandFound`, as it already is) or run `node ./node_modules/next/dist/bin/next dev` directly if you hit issues.

### 5️⃣ Seed Demo Users

With the dev server running, hit the seed endpoint once to create demo accounts:

```bash
curl http://localhost:3000/api/seed
```

This creates:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@campus.edu` | `x7Q@m#9Lp$2Bv&W` |
| Student | `student@campus.edu` | `x7Q@m#9Lp$2Bv&W` |

> 🔒 **Security note:** These credentials are hard-coded in `src/app/api/seed/route.js` for demo/dev convenience. Remove or protect this route before deploying to production, and change these passwords immediately if you keep it.

### 6️⃣ Open in Browser

```
http://localhost:3000
```

You'll be redirected to `/login`. Use the demo credentials above, or click the **Student** / **Admin** toggle on the login page to auto-fill them.

---

## 🏭 Production Build

```bash
npm run build
npm run start
```

Make sure `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `MONGODB_URI` are set in your production environment (e.g. your hosting provider's environment variable settings).

---

## 🔌 API Endpoints

All endpoints below (except `/api/auth/*` and `/api/seed`) require an authenticated session; requests without a valid session receive `401 Unauthorized`.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/items` | Any signed-in user | List items, optional `?status=` and `?category=` filters. Admins get full audit data; students get a stripped view. |
| `GET` | `/api/items/:id` | Any signed-in user | Get a single item. |
| `POST` | `/api/items` | Any signed-in user | Create a new item (multipart form with optional image). Validates status, category, and date format. |
| `PATCH` | `/api/items/:id` | Students: claim only · Admins: any field | Students may only set `status: "Claimed"`. Admins can update name, description, location, contact, date, category, and status. Every status change is appended to `statusHistory`. |
| `DELETE` | `/api/items/:id` | Admin only | Deletes the item and its associated image document, if any. |
| `GET` | `/api/images/:id` | Any signed-in user | Streams the raw image bytes stored in MongoDB. |
| `DELETE` | `/api/images/:id` | Admin only | Deletes an orphaned/replaced image document. |
| `GET` / `POST` | `/api/auth/[...nextauth]` | Public | NextAuth.js sign-in/sign-out/session endpoints. |
| `GET` | `/api/seed` | Public (dev only — see note above) | Seeds demo admin & student accounts. |

---

## 🔐 Roles & Permissions

| Capability | Student | Admin |
|---|:---:|:---:|
| Browse & search items | ✅ | ✅ |
| Report a lost/found item | ✅ | ✅ |
| Claim an item | ✅ | ✅ |
| Edit any item field | ❌ | ✅ |
| Delete an item | ❌ | ✅ |
| View submitter / claimer identity & status history | ❌ | ✅ |

---

## 🔄 Application Workflow

1. A user logs in via `/login`; NextAuth issues a JWT session containing their `role`.
2. `middleware.js` protects every route except `/login`, `/api/auth`, and `/api/seed`, redirecting unauthenticated users to the login page.
3. The user submits a lost/found report via the report modal. The form (with an optional image) is sent as `multipart/form-data`.
4. If an image is attached, its bytes are stored as a MongoDB `Image` document, and the item's `image` field stores a reference URL (`/api/images/:id`).
5. The `Item` document is created with a `submittedBy` snapshot and an initial `statusHistory` entry.
6. The React frontend (via `ItemsContext`) fetches items, and supports client-side search, category/status filtering, and sorting (newest, oldest, A–Z, Z–A).
7. Users can claim an item, which updates its status, records `claimedBy`, and appends to `statusHistory`.
8. Admins can additionally edit item details or delete items entirely (which also cleans up the associated image).

---

## 🚀 What Changed Since v1

The original prototype used a flat `items.json` file and local `public/uploads/` folder with no authentication. This version replaces that layer entirely:

- ✅ MongoDB (via Mongoose) instead of a JSON file
- ✅ Images stored as binary data in MongoDB instead of the local filesystem
- ✅ Full authentication with NextAuth.js (Credentials provider + JWT sessions)
- ✅ Role-based access control (student vs. admin)
- ✅ Per-item audit trail (`submittedBy`, `claimedBy`, `statusHistory`)
- ✅ Route protection via Next.js middleware

---

## 🚀 Future Improvements

- ☁️ Move image storage to a dedicated object store (e.g. Cloudinary/S3) for better scalability than MongoDB binary blobs
- 📧 Email notifications when an item matching a lost report is found
- 🔎 Fuzzy/full-text search (e.g. MongoDB Atlas Search)
- 👤 Self-service registration flow (currently accounts are created only via the seed route)
- 🧪 Automated tests using `mongodb-memory-server`

---

## 👨‍💻 Author

**Arpit**
Full Stack Developer (Beginner → Growing 🚀)

---

## 📜 License

This project is built for educational and learning purposes.