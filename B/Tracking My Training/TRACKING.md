# 📍 TRACKING — Live Progress & Resume File

> **Purpose:** This file is the *single source of truth* for "where are we right now." If we
> open a brand‑new chat tomorrow, I read this file first and continue **exactly** where we
> stopped — no lost context, no forgotten steps. Updated on every **"save"**.
>
> Companion file: `UNIVERSAL_MASTER_PLAN.md` (the full curriculum blueprint).

---

## 🧭 CURRENT POSITION

| Field | Value |
|---|---|
| **Today** | 2026‑06‑04 |
| **Course** | Project Kastel — rebuilding *UTM Borrow* full‑stack |
| **Current Month (Chapter)** | Month 0 — Ground Zero |
| **Current Week (Sub‑lesson)** | 0.2 — The terminal & your tools |
| **Current Day (Session)** | Not yet started |
| **Next action** | Begin Month 0 · Week 0.2, Hour 1 |
| **Overall progress** | 0 / 100 homework files written · 1 lesson delivered |

---

## 🗓️ DETAILED DAY PLAN — current week (expanded just‑in‑time)

### Month 0 · Week 0.1 — "How software talks" (first session, 4 hours)
- **Hour 1 (09:00–10:00):** What a program is · client vs server · the internet in plain words.
- **Hour 2 (10:00–11:00):** HTTP — request & response · what a URL really asks for · status codes.
- **Hour 3 (11:00–12:00):** Frontend vs backend vs database — the three‑part anatomy of UTM Borrow.
- **Hour 4 (12:00–13:00):** Recap + first tiny "homework" (a written explanation, no code yet) + confirm understanding.

*(Hour plans for later weeks are written here when we reach them.)*

---

## ✅ LESSON CHECKLIST (Months → Weeks)

> ⬜ not started · 🟦 in progress · ✅ complete

### Month 0 — Ground Zero
- ✅ 0.1 How software talks
- ⬜ 0.2 The terminal & your tools
- ⬜ 0.3 Thinking in Python
- ⬜ 0.4 Data shapes & async

### Month 1 — Backend Foundations
- ⬜ 1.1 Declaring the toolbox (`requirements.txt`)
- ⬜ 1.2 Secrets & environment (`runtime.txt`, `.env`)
- ⬜ 1.3 The data layer (`database.py`)
- ⬜ 1.4 The application is born (`server.py`)

### Month 2 — Identity & Security
- ⬜ 2.1 Never store a password (bcrypt)
- ⬜ 2.2 The signed wristband (JWT)
- ⬜ 2.3 Register & Login (`routers/auth.py`)
- ⬜ 2.4 Account status & admin tiers

### Month 3 — The Domain: Items
- ⬜ 3.1 Listing an item (`routers/items.py`)
- ⬜ 3.2 Search, enums & owner‑scoping
- ⬜ 3.3 Seeding a living demo (`seed.py`)
- ⬜ 3.4 Bookmarks (`routers/saved.py`)

### Month 4 — Transactions & QR Handover
- ⬜ 4.1 The borrow state machine (`routers/transactions.py`)
- ⬜ 4.2 Enrichment & trust (`tx_common.py`)
- ⬜ 4.3 Tamper‑proof QR tokens (`qr_engine.py`)
- ⬜ 4.4 Handover, return & ratings (`routers/qr.py`, `ratings.py`)

### Month 5 — Communication & Real‑time
- ⬜ 5.1 The broadcaster (`realtime.py`)
- ⬜ 5.2 Live streams / SSE (`routers/events.py`)
- ⬜ 5.3 Notifications (`notifications.py`, `routers/profile.py`)
- ⬜ 5.4 Encrypted chat (`crypto_box.py`, `routers/chat.py`)

### Month 6 — Moderation & Admin Portal
- ⬜ 6.1 Reports & moderation (`routers/moderation.py`)
- ⬜ 6.2 Step‑up MFA (`mfa.py`, `emailer.py`)
- ⬜ 6.3 Admin control panel (`routers/admin.py`)
- ⬜ 6.4 Support, dashboard & tests

### Month 7 — Frontend Foundations
- ⬜ 7.1 HTML & the document (`public/index.html`)
- ⬜ 7.2 JavaScript essentials for React
- ⬜ 7.3 React & CRA (`package.json`, `src/index.js`)
- ⬜ 7.4 Tailwind & design system (`tailwind.config.js`, `index.css`)

### Month 8 — Frontend Architecture & State
- ⬜ 8.1 axios client (`lib/api.js`)
- ⬜ 8.2 Auth Context (`context/AuthContext.js`)
- ⬜ 8.3 Routing & guards (`App.js`)
- ⬜ 8.4 Layout shell & UI kit (`components/Layout.js`, `ui.js`)

### Month 9 — The Student Experience
- ⬜ 9.1 Auth screens (`pages/identity/*`)
- ⬜ 9.2 Item screens (`pages/Resource/*`)
- ⬜ 9.3 Discovery hub & deal flow (`pages/Transaction/*`)
- ⬜ 9.4 Live UI, motion & shared pieces (`lib/*`, `hooks/*`, `components/*`)

### Month 10 — Admin Frontend & Launch
- ⬜ 10.1 Isolated admin shell (`pages/admin/AdminLayout.js`, …)
- ⬜ 10.2 Admin tools (`pages/admin/*`)
- ⬜ 10.3 End‑to‑end integration
- ⬜ 10.4 Deployment & castle reveal (`Dockerfile`, `render.yaml`, `vercel.json`)

---

## 🧱 HOMEWORK FILE CHECKLIST (mirror of Folder A — the castle's blueprint)

> Files in `Homework/` are created **only when the lesson for that file is completed**.
> Nothing is pre-created. Each tick below means: lesson taught + homework written + validated.
> ⬜ not created yet · 🟦 in progress (file exists, work ongoing) · ✅ complete (file written & validated)

### Backend — `Homework/backend/`
- ⬜ `requirements.txt`
- ⬜ `runtime.txt`
- ⬜ `database.py`
- ⬜ `server.py`
- ⬜ `security.py`
- ⬜ `qr_engine.py`
- ⬜ `crypto_box.py`
- ⬜ `tx_common.py`
- ⬜ `realtime.py`
- ⬜ `notifications.py`
- ⬜ `mfa.py`
- ⬜ `emailer.py`
- ⬜ `seed.py`
- ⬜ `Dockerfile`
- ⬜ `routers/__init__.py`
- ⬜ `routers/auth.py`
- ⬜ `routers/items.py`
- ⬜ `routers/transactions.py`
- ⬜ `routers/qr.py`
- ⬜ `routers/ratings.py`
- ⬜ `routers/profile.py`
- ⬜ `routers/dashboard.py`
- ⬜ `routers/moderation.py`
- ⬜ `routers/events.py`
- ⬜ `routers/admin.py`
- ⬜ `routers/chat.py`
- ⬜ `routers/support.py`
- ⬜ `routers/saved.py`
- ⬜ `tests/conftest.py`
- ⬜ `tests/test_utm_borrow.py`
- ⬜ `tests/test_moderation_extras.py`

### Frontend config — `Homework/frontend/`
- ⬜ `package.json`
- ⬜ `tailwind.config.js`
- ⬜ `postcss.config.js`
- ⬜ `vercel.json`
- ⬜ `public/index.html`

### Frontend core — `Homework/frontend/src/`
- ⬜ `index.js`
- ⬜ `index.css`
- ⬜ `App.js`
- ⬜ `context/AuthContext.js`
- ⬜ `lib/api.js`
- ⬜ `lib/realtime.js`
- ⬜ `lib/format.js`
- ⬜ `lib/motion.js`
- ⬜ `hooks/useRouteRefresh.js`

### Frontend components — `Homework/frontend/src/components/`
- ⬜ `Layout.js`
- ⬜ `ui.js`
- ⬜ `ExploreCards.js`
- ⬜ `ItemCard.js`
- ⬜ `Toast.js`
- ⬜ `Skeleton.js`
- ⬜ `RatingDialog.js`
- ⬜ `ActiveLoanBanner.js`
- ⬜ `UrgentBanner.js`

### Frontend pages — identity — `Homework/frontend/src/pages/identity/`
- ⬜ `AuthShell.js`
- ⬜ `Login.js`
- ⬜ `Register.js`
- ⬜ `Profile.js`
- ⬜ `PublicProfile.js`
- ⬜ `SettingsHub.js`
- ⬜ `SettingsSecurity.js`
- ⬜ `ForgotPassword.js`
- ⬜ `ResetPassword.js`
- ⬜ `Reputation.js`
- ⬜ `HelpSupport.js`
- ⬜ `NotificationPreferences.js`
- ⬜ `Governance.js`

### Frontend pages — Resource — `Homework/frontend/src/pages/Resource/`
- ⬜ `ItemDetail.js`
- ⬜ `ItemForm.js`
- ⬜ `Lend.js`
- ⬜ `Catalog.js`

### Frontend pages — Transaction — `Homework/frontend/src/pages/Transaction/`
- ⬜ `Home.js`
- ⬜ `TransactionDetail.js`
- ⬜ `Chat.js`
- ⬜ `Scanner.js`
- ⬜ `Notifications.js`
- ⬜ `TransactionHistory.js`
- ⬜ `Dashboard.js`
- ⬜ `PopularAll.js`
- ⬜ `NearbyAll.js`

### Frontend pages — admin — `Homework/frontend/src/pages/admin/`
- ⬜ `AdminLayout.js`
- ⬜ `AdminElevate.js`
- ⬜ `AdminOverview.js`
- ⬜ `AdminInbox.js`
- ⬜ `AdminUsers.js`
- ⬜ `AdminUserDetail.js`
- ⬜ `AdminTransactions.js`
- ⬜ `AdminTransactionDetail.js`
- ⬜ `AdminReports.js`
- ⬜ `AdminOverdue.js`
- ⬜ `AdminScan.js`
- ⬜ `AdminAnalytics.js`
- ⬜ `AdminAudit.js`
- ⬜ `AdminProfile.js`
- ⬜ `AdminCommandPalette.js`

### Frontend pages — top‑level (legacy/retired, built last for completeness)
- ⬜ `pages/Catalog.js`
- ⬜ `pages/Dashboard.js`
- ⬜ `pages/Moderation.js`
- ⬜ `pages/ReportDetail.js`

### Root deployment
- ⬜ `render.yaml`

---

## 📖 SESSION LOG (sequential narrative — append‑only)

> Newest entry at the bottom. Each "save" adds an entry so a fresh chat can reconstruct the
> whole journey by reading top to bottom.

- **2026‑06‑04 — Session 0 (Setup).** Instructor analysed Folder A (UTM Borrow: FastAPI +
  MongoDB backend, React + Tailwind frontend, QR handovers, SSE real‑time, MFA admin portal).
  Confirmed Folder B is the workspace. Created `Homework/` folder (empty, files created per lesson),
  `UNIVERSAL_MASTER_PLAN.md` (11‑chapter curriculum), and this `TRACKING.md`. No lessons yet.

- **2026‑06‑04 — Session 1 · Month 0 · Week 0.1 — "How software talks" (4 hours). COMPLETE ✅**
  Taught: what a program is; client/server; HTTP request/response; HTTP verbs (GET/POST/PATCH/DELETE);
  status codes (200/201/400/401/403/404/500); the Authorization header (JWT wristband concept);
  the 3-layer anatomy (Frontend/Backend/Database); build order (Database→Backend→Frontend).
  Homework: student traced the full journey of loading an item screen in their own words.
  Key corrections given: (1) status codes belong on the response, not the request; (2) files are
  `.py` not `.js` on the backend; (3) `index.js` is the ignition key, `ItemDetail.js` is the screen;
  (4) the Authorization header carries identity proof, not a DB routing instruction.
  Student demonstrated solid conceptual understanding. Ready for Week 0.2.

---

## 🔑 RESUME INSTRUCTIONS (for a future me, in a new chat)

If you are reading this in a fresh conversation:
1. Read `UNIVERSAL_MASTER_PLAN.md` (the curriculum) and this whole file (the live state).
2. Folder A = `../A` is **read‑only inspiration** — never write to it.
3. Folder B (here) holds `Homework/`, the plan, and this tracker.
4. The student's true level = the **last ✅ in the Lesson Checklist** above; resume at the first ⬜.
5. Re‑read the most recent Session Log entry to recall tone, pace, and the exact next step.
6. Honour the Golden Rules: theory before code, blank canvas, micro‑steps, confirm before advancing.
