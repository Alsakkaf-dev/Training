# 🏰 UNIVERSAL MASTER PLAN — "Project Kastel"

### The Reconstruction of **UTM Borrow** — a full‑stack campus lending platform

> **Student:** Mohammed Alsakkaf · **Instructor:** Principal Full‑Stack Engineer (Claude)
> **Start date:** 2026‑06‑04 · **Starting knowledge:** 0% (blank canvas)
> **Study budget:** 4 h/day · 09:00–13:00 · Saturday → Thursday · = **24 h/week**
>
> This is a **living document**. It is the blueprint. Progress is tracked in `TRACKING.md`.
> When the student types **"save"**, both this file and `TRACKING.md` are updated.
# hi, hello world
---

## 0. What we are secretly building (The Lecturer's Secret)

You believe you are taking daily lessons and solving small exercises. In truth, **every
homework answer is a real line from a real, deployed application** called **UTM Borrow** —
a peer‑to‑peer item‑lending app for Universiti Teknologi Malaysia students. Block by block,
you are rebuilding the entire castle from the ground up. You will not see the full shape
until the end. I, the architect, am collecting every block.

**The real application (Folder A) — what it does, in one breath:**
A UTM student can list an item they own (a calculator, a camera, a football), another
student requests to borrow it for a date range, the two chat privately, they meet and
scan a **QR code** to hand it over, the borrower returns it (another QR scan), and both
rate each other — which builds a **trust score**. Admins moderate reports through a
separate, **MFA‑protected** control panel. Everything updates **live** without refreshing
the page.

**The technology stack you will master:**

| Layer | Technology | Folder A location |
|---|---|---|
| Backend language | **Python** | `backend/` |
| Backend framework | **FastAPI** + **Uvicorn** | `backend/server.py` |
| Database | **MongoDB** (via `motor` async driver) | `backend/database.py` |
| Auth | **bcrypt** + **JWT** + **TOTP MFA** | `backend/security.py`, `mfa.py` |
| Frontend language | **JavaScript** | `frontend/src/` |
| Frontend framework | **React** (Create React App) | `frontend/src/App.js` |
| Markup / Style | **HTML** + **CSS** + **Tailwind** | `frontend/public/index.html`, `index.css` |
| Animation | **Framer Motion** | `frontend/src/lib/motion.js` |
| Real‑time | **Server‑Sent Events (SSE)** | `backend/realtime.py`, `frontend/lib/realtime.js` |
| Deployment | **Docker**, **Render**, **Vercel** | `Dockerfile`, `render.yaml`, `vercel.json` |

---

## I. The Structural Hierarchy (how time is organised)

This is **effort‑based**, not calendar‑based. A "Month" is a phase of construction, not 30
days. We move at the speed *you* confirm understanding — never faster.

```
ACADEMIC YEAR   = The whole project (rebuild UTM Borrow end‑to‑end)
 └─ MONTH       = Chapter   → a major architectural component
     └─ WEEK    = Sub‑lesson → one technology or feature
         └─ DAY = Session    → one 4‑hour sitting, split into hourly blocks
```

**The Golden Rules I teach by** (from your directive):
1. **Theory first.** No code is written until you've had the full "Why" + "How" lecture.
2. **Blank canvas.** You never open Folder A or copy a line. You write every character yourself.
3. **Chronological evolution.** We build in the exact order a real lead engineer would — backend foundation before frontend, data before display, no file before its time.
4. **Micro‑steps.** Tiny snippets, each fully explained. We do not advance until you confirm.
5. **The "Why" before every step** — the Architectural Rationale: *what problem are we solving right now, and why this tool?*

---

## II. The Curriculum — Year → Months → Weeks

> **Legend:** ⬜ not started · 🟦 in progress · ✅ complete
> Day‑level (hourly) detail is expanded **just‑in‑time** at the start of each week, so the
> plan stays accurate to your real pace. Months 0–1 are already expanded to day level below.

---

### 🅼 MONTH 0 — GROUND ZERO *(the knowledge that lets the castle exist)*
*Status: ⬜ · No Folder A file yet — this is the "pre‑history" every engineer carries in their head.*

| Week | Title | What you learn | Homework target |
|---|---|---|---|
| 0.1 | How software talks | Client/server, the internet, HTTP request/response, what "frontend" vs "backend" means | (concept only) |
| 0.2 | The terminal & your tools | PowerShell basics, folders/files, running a program, what an "editor" is | (concept only) |
| 0.3 | Thinking in Python | Variables, types, `print`, functions, dicts/lists, `import`, what a module is | (sandbox file) |
| 0.4 | Data shapes & async | JSON, key/value thinking, sync vs async, `async`/`await` in plain language | (sandbox file) |

---

### 🅼 MONTH 1 — BACKEND FOUNDATIONS *(the server's first heartbeat)*
*Maps to: `requirements.txt` → `database.py` → `server.py`. This is the real Day 1 of the project.*

| Week | Title | Folder A file | Homework target |
|---|---|---|---|
| 1.1 | Declaring the toolbox | `backend/requirements.txt` | `Homework/backend/requirements.txt` |
| 1.2 | Secrets & environment | `.env`, `python-dotenv`, `runtime.txt` | `Homework/backend/runtime.txt` |
| 1.3 | The data layer | `backend/database.py` | `Homework/backend/database.py` |
| 1.4 | The application is born | `backend/server.py` | `Homework/backend/server.py` |

---

### 🅼 MONTH 2 — IDENTITY & SECURITY *(who are you, and can I trust this request?)*
*Maps to: `security.py` → `routers/auth.py`.*

| Week | Title | Folder A file | Homework target |
|---|---|---|---|
| 2.1 | Never store a password | `security.py` (bcrypt hashing) | `Homework/backend/security.py` |
| 2.2 | The signed wristband (JWT) | `security.py` (PyJWT tokens) | `Homework/backend/security.py` |
| 2.3 | Register & Login | `routers/auth.py` (Pydantic, UTM email regex) | `Homework/backend/routers/auth.py` |
| 2.4 | Account status & admin tiers | `security.py` (Active/Suspended/Banned, admin gates) | `Homework/backend/security.py` |

---

### 🅼 MONTH 3 — THE DOMAIN: ITEMS *(the thing being lent)*
*Maps to: `routers/items.py` → `seed.py` → `routers/saved.py`.*

| Week | Title | Folder A file | Homework target |
|---|---|---|---|
| 3.1 | Listing an item (CRUD) | `routers/items.py` | `Homework/backend/routers/items.py` |
| 3.2 | Search, enums & owner‑scoping | `routers/items.py` | `Homework/backend/routers/items.py` |
| 3.3 | Seeding a living demo | `seed.py` | `Homework/backend/seed.py` |
| 3.4 | Bookmarks | `routers/saved.py` | `Homework/backend/routers/saved.py` |

---

### 🅼 MONTH 4 — TRANSACTIONS & THE QR HANDOVER *(the beating heart — the state machine)*
*Maps to: `transactions.py` → `tx_common.py` → `qr_engine.py` → `qr.py` → `ratings.py`.*

| Week | Title | Folder A file | Homework target |
|---|---|---|---|
| 4.1 | The borrow state machine | `routers/transactions.py` | `Homework/backend/routers/transactions.py` |
| 4.2 | Joining the data (enrichment & trust) | `tx_common.py` | `Homework/backend/tx_common.py` |
| 4.3 | Tamper‑proof QR tokens | `qr_engine.py` | `Homework/backend/qr_engine.py` |
| 4.4 | Handover, return & ratings | `routers/qr.py`, `routers/ratings.py` | `Homework/backend/routers/qr.py`, `ratings.py` |

---

### 🅼 MONTH 5 — COMMUNICATION & REAL‑TIME *(the app comes alive)*
*Maps to: `realtime.py` → `events.py` → `notifications.py` → `crypto_box.py` → `chat.py`.*

| Week | Title | Folder A file | Homework target |
|---|---|---|---|
| 5.1 | The broadcaster (pub/sub) | `realtime.py` | `Homework/backend/realtime.py` |
| 5.2 | Live streams (SSE) | `routers/events.py` | `Homework/backend/routers/events.py` |
| 5.3 | Notifications | `notifications.py`, `routers/profile.py` | `Homework/backend/notifications.py`, `routers/profile.py` |
| 5.4 | Encrypted chat | `crypto_box.py`, `routers/chat.py` | `Homework/backend/crypto_box.py`, `routers/chat.py` |

---

### 🅼 MONTH 6 — MODERATION & THE ADMIN PORTAL *(RBAC + MFA — the fortress)*
*Maps to: `moderation.py` → `mfa.py` → `admin.py` → `support.py`, `dashboard.py`, tests.*

| Week | Title | Folder A file | Homework target |
|---|---|---|---|
| 6.1 | Reports & moderation | `routers/moderation.py` | `Homework/backend/routers/moderation.py` |
| 6.2 | Step‑up MFA (TOTP) | `mfa.py`, `emailer.py` | `Homework/backend/mfa.py`, `emailer.py` |
| 6.3 | The admin control panel (RBAC + audit) | `routers/admin.py` | `Homework/backend/routers/admin.py` |
| 6.4 | Support, dashboard & backend tests | `routers/support.py`, `dashboard.py`, `tests/` | `Homework/backend/routers/support.py`, `dashboard.py`, `tests/*` |

---

### 🅼 MONTH 7 — FRONTEND FOUNDATIONS *(the face of the app)*
*Maps to: `public/index.html` → `index.js` → `package.json` → `tailwind.config.js` → `index.css`.*

| Week | Title | Folder A file | Homework target |
|---|---|---|---|
| 7.1 | HTML & the document | `frontend/public/index.html` | `Homework/frontend/public/index.html` |
| 7.2 | JavaScript essentials for React | (sandbox) | `Homework/frontend/src/index.js` (prep) |
| 7.3 | React & the CRA toolchain | `package.json`, `src/index.js` | `Homework/frontend/package.json`, `src/index.js` |
| 7.4 | Tailwind & the design system | `tailwind.config.js`, `postcss.config.js`, `index.css` | `Homework/frontend/tailwind.config.js`, `postcss.config.js`, `src/index.css` |

---

### 🅼 MONTH 8 — FRONTEND ARCHITECTURE & STATE *(the wiring behind every screen)*
*Maps to: `lib/api.js` → `context/AuthContext.js` → `App.js` → `components/Layout.js`, `ui.js`.*

| Week | Title | Folder A file | Homework target |
|---|---|---|---|
| 8.1 | Talking to the backend (axios) | `src/lib/api.js` | `Homework/frontend/src/lib/api.js` |
| 8.2 | Global auth state (Context) | `src/context/AuthContext.js` | `Homework/frontend/src/context/AuthContext.js` |
| 8.3 | Routing & route guards | `src/App.js` | `Homework/frontend/src/App.js` |
| 8.4 | Layout shell & the UI kit | `components/Layout.js`, `components/ui.js` | `Homework/frontend/src/components/Layout.js`, `ui.js` |

---

### 🅼 MONTH 9 — THE STUDENT EXPERIENCE *(the screens a student actually uses)*
*Maps to: `pages/identity/*` → `pages/Resource/*` → `pages/Transaction/*` → frontend libs/hooks.*

| Week | Title | Folder A file(s) | Homework target |
|---|---|---|---|
| 9.1 | Auth screens | `identity/AuthShell.js`, `Login.js`, `Register.js`, `Profile.js` | `Homework/frontend/src/pages/identity/*` |
| 9.2 | Item screens | `Resource/ItemDetail.js`, `ItemForm.js`, `Lend.js` | `Homework/frontend/src/pages/Resource/*` |
| 9.3 | The discovery hub & deal flow | `Transaction/Home.js`, `TransactionDetail.js`, `Chat.js`, `Scanner.js`, `Notifications.js` | `Homework/frontend/src/pages/Transaction/*` |
| 9.4 | Live UI, motion & shared pieces | `lib/realtime.js`, `lib/format.js`, `lib/motion.js`, `hooks/useRouteRefresh.js`, `components/*` | `Homework/frontend/src/lib/*`, `hooks/*`, `components/*` |

---

### 🅼 MONTH 10 — THE ADMIN FRONTEND & LAUNCH *(the keep at the top of the castle)*
*Maps to: `pages/admin/*` → integration → `Dockerfile`, `render.yaml`, `vercel.json`, `DEPLOY.md`.*

| Week | Title | Folder A file(s) | Homework target |
|---|---|---|---|
| 10.1 | The isolated admin shell | `admin/AdminLayout.js`, `AdminElevate.js`, `AdminOverview.js` | `Homework/frontend/src/pages/admin/*` |
| 10.2 | Admin tools | `AdminInbox.js`, `AdminUsers.js`, `AdminTransactions.js`, `AdminReports.js`, `AdminAnalytics.js`, `AdminAudit.js`, … | `Homework/frontend/src/pages/admin/*` |
| 10.3 | End‑to‑end integration | the full borrow → QR → return → rate loop, live | (all) |
| 10.4 | Deployment & the castle reveal | `Dockerfile`, `render.yaml`, `vercel.json`, `DEPLOY.md` | `Homework/backend/Dockerfile`, `Homework/render.yaml`, … |

---

## IIIs. How a single session  runs (the loop we repeat)

1. **🎓 Lecture (Theory — the "Why").** I explain the problem this block solves and the tool we'll use, university‑lecture depth, before any code.
2. **🔬 Walkthrough (Practice — the "How").** I break the target into tiny snippets and explain each line.
3. **✍️ Homework (Reconstruction).** I give you an exercise phrased as a task/question. You write the code by hand into the matching `Homework/` file. (Secretly: these are the real lines of UTM Borrow.)
4. **✅ Validation.** You show me your work; I check it, correct gently, and we mark the checklist.
5. **🔁 Confirm & advance.** Only when you say you understand do we move to the next micro‑step.

**Commands you can give me anytime:**
- **"save"** → I update `TRACKING.md` + this plan with everything covered and the checklist state, so a brand‑new chat can resume perfectly.
- **"where am I?"** → I summarise current Month/Week/Day and the next step.
- **"next"** → advance to the next micro‑step (only after you confirm understanding).
- **"go slower" / "explain again"** → I re‑teach the current block from another angle.

---

## IV. Rules I bind myself to

- I will **never** write into Folder A. I only **read** it for inspiration and ground truth.
- I will **never** tell you to open Folder A or copy from it. You start from zero, every time.
- I will **never** give you code to write before its theory lecture.
- I will follow the **chronological build order** above — backend before frontend, data before display.
- I keep `TRACKING.md` truthful: what's done is done, what's skipped is marked skipped.

---

*End of Master Plan. The detailed, hour‑by‑hour day plan for the current week always lives at
the top of `TRACKING.md`.*
