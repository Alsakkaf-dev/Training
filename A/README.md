# UTM Borrow

A campus peer-to-peer item-lending app for **Universiti Teknologi Malaysia** — borrow textbooks, lab tools, formal wear and gear from fellow students, secured by **QR-signed handovers**, **real-time trust scores**, and **live Server-Sent Event** updates.

> **Live:** [alsakkaf.site](https://alsakkaf.site) · A project by [Mohammed Alsakkaf](https://alsakkaf.site)

---

## Features

### For Students
- **Campus catalog** — browse and filter items by category, condition, college and faculty; e-commerce-style item detail with photo gallery, rating stars, attribute chips and reviews.
- **Borrow flow** — a strict state machine: Request → Approved → QR Handover → Borrowed → QR Return → Completed.
- **Segmented activity dashboard** — separate Borrower and Lender views with their own stat counters (Pending / Active / Urgent), so each role only sees what's relevant.
- **QR-signed handovers** — every physical exchange confirmed with an HMAC-SHA256, time-limited QR code. Status only moves to *Borrowed* after a successful scan.
- **Real-time updates** — approvals, returns, return requests and notifications stream live over Server-Sent Events; the UI updates without a page reload.
- **Trust scores** — ratings are saved both per-user and per-listing; averages are recomputed live from real data. New users show "—" until they earn a rating.
- **Personal inventory** — lenders manage their listings from the Lend tab, with a one-tap **Public / Private** visibility toggle per item (no edit page required).
- **Secure peer chat** — messages encrypted at rest (HMAC-SHA256 CTR keystream); chat history is automatically wiped on cancellation or rejection for privacy.
- **Rating pop-up** — borrowers are prompted to rate their lender immediately after a QR handover scan, then redirected to Home.
- **Urgent returns** — lenders can flag a return request; it instantly bumps the borrower's *Urgent Returns* counter via realtime.
- **Notifications** — auto-marked as read when the notification page opens; each alert has a Delete button for individual removal.

### For Admins
- **MFA-gated admin portal** — TOTP step-up (the same engine used for student 2FA) mints a short-lived `admin_session` token before any sensitive action.
- **Listing visibility controls** — Public / Private / Removed radio buttons directly in the deal detail view and on reports, without navigating away.
- **User management** — suspend (with duration choice + option to keep or permanently remove the user's listings), reinstate, or hard-delete; admins never see their own account in the list.
- **Audit trail** — every mutating admin action is written to `admin_audit` and broadcast as `admin.changed`.
- **Admin inbox** — unified view of open reports, help tickets and fraud flags.
- **Fraud detection** — explainable heuristics: repeatedly-reported users, overdue loans, high cancellation rates.

### Account & Security
- **Two-factor authentication** — TOTP-based (Google Authenticator / Authy); full setup, verify-enable, and disable flow backed by real backend endpoints.
- **Password change** — verifies the current password before updating; separate from the forgot-password recovery flow.
- **Active sessions** — lists every real login session with device info and last-seen time; revoke individual sessions or sign out all other devices.
- **UTM email verified** — registration is gated to `@graduate.utm.my` / `@utm.my` addresses; the email is the user's immutable identity.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18 (CRA), React Router v6, Tailwind CSS v3, Framer Motion v12, Phosphor Icons, Axios |
| Backend | FastAPI 0.136, Motor 3.7 (async MongoDB), PyJWT, bcrypt, python-dotenv |
| Realtime | Server-Sent Events — in-process pub/sub (`realtime.py`); swap internals for Redis for multi-worker |
| Database | MongoDB (local `:27017` or Atlas) |
| QR | HMAC-SHA256 signed, time-limited tokens (`qr_engine.py`) |
| Chat encryption | Symmetric HMAC-SHA256 CTR keystream + auth tag (`crypto_box.py`) |
| 2FA | TOTP via `mfa.py` (shared by student accounts and admin portal) |

---

## Quick Start

### Option 1 — Windows launchers (recommended)

```powershell
# From the repo root — starts backend (:8000) and frontend (:3000), both hot-reloading
START APP.bat

# To stop everything
STOP APP.bat
```

### Option 2 — Manual

```powershell
# Backend  (requires local MongoDB on :27017)
cd backend
copy .env.example .env    # fill in values (see below)
py -3.14 -m pip install -r requirements.txt
py -3.14 -m uvicorn server:app --reload

# Frontend (new terminal)
cd frontend
copy .env.example .env    # set REACT_APP_BACKEND_URL=http://localhost:8000
npm install
npm start
```

### Environment variables

**`backend/.env`** (required — server crashes without it):

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name (e.g. `utm_borrow`) |
| `JWT_SECRET` | Secret for signing user JWTs |
| `QR_HMAC_SECRET` | Secret for signing QR tokens |
| `CORS_ORIGINS` | Comma-separated frontend origins |
| `CHAT_SECRET` | *(optional)* Separate secret for chat-at-rest encryption; falls back to `JWT_SECRET` |
| `ADMIN_MFA_DEV_HINT` | *(optional)* Set `1` to surface live TOTP codes in dev responses |

**`frontend/.env`**:

| Variable | Description |
|----------|-------------|
| `REACT_APP_BACKEND_URL` | Backend base URL, e.g. `http://localhost:8000` |

Both `.env` files are gitignored and must be created locally.

---

## Demo Accounts

Password for all: **`Test1234`**

| Role | Email |
|------|-------|
| Student | `alsakkaf@graduate.utm.my` |
| Student | `muaz@graduate.utm.my` |
| Student | `ahmat@graduate.utm.my` |
| Admin | `admin@utm.my` |

The seeded dataset includes 8 items and transactions in every status: Pending, Approved+QR, Borrowed+active lease, Completed+ratings, and one pending moderation report.

---

## Project Structure

```
backend/
  server.py           FastAPI app, CORS, router includes, startup seed
  database.py         Motor async client; all docs keyed by string uuid4 id
  security.py         bcrypt + JWT (HS256); user sessions; get_current_user / get_admin_session
  mfa.py              TOTP step-up (shared by student 2FA and admin portal)
  crypto_box.py       Chat-at-rest symmetric encryption
  qr_engine.py        HMAC-SHA256 QR token generation and verification
  tx_common.py        enrich_transaction, recompute_trust_score, compute_lease_flags
  realtime.py         In-process SSE broadcaster (pub/sub by user id)
  seed.py             Idempotent demo data seeder
  routers/
    auth.py           Register / login / sessions / change-password / 2FA / password-reset
    items.py          Catalog browse / my items / visibility toggle / CRUD
    transactions.py   Request → approve / reject / cancel / request-return workflow
    qr.py             QR generate and scan (handover + return)
    dashboard.py      Per-role summary stats (pending-out, active-borrowed, pending-in, active-lent)
    ratings.py        Submit rating / per-user / per-item aggregate
    chat.py           Encrypted peer chat tied to a transaction
    profile.py        Profile update / notification list / read / delete
    events.py         SSE stream endpoint
    admin.py          MFA-gated admin portal (users, transactions, visibility, audit)
    moderation.py     Reports queue (backward-compat get_current_admin surface)
    support.py        Help tickets / admin inbox / fraud heuristics
    dashboard.py      Role-split activity summary

frontend/src/
  App.js              Routes + Protected / StudentOnly / AdminOnly guards
  context/
    AuthContext.js    Auth state, JWT, realtime connect, unread count
  lib/
    api.js            Axios instances: api (user token) + adminApi (admin_session token)
    realtime.js       Shared EventSource; useRealtimeEvent / useRealtimeStatus hooks
  components/
    Layout.js         Sticky header, floating bottom nav, handover rating prompt
    ui.js             Full design-system kit (Button, Modal, Avatar, StatusBadge, …)
    RatingDialog.js   Reusable TOTP rating modal
    Toast.js          toast.success / error / info
  pages/
    Dashboard.js      Segmented Borrower / Lender activity hub
    Transaction/      Home, Chat, TransactionDetail, Scanner, Notifications, History
    Resource/         Catalog, ItemDetail (e-commerce layout), ItemForm, Lend (inventory)
    identity/         Login, Register, Profile, SettingsSecurity (real 2FA + sessions)
    admin/            AdminLayout, AdminOverview, AdminUsers, AdminTransactionDetail, …
```

---

## Realtime Event Types

All server→client pushes go over SSE. The client allowlist is in [`src/lib/realtime.js`](frontend/src/lib/realtime.js) — add new types there **and** in the backend router, or the client silently drops them.

| Event | Trigger |
|-------|---------|
| `transaction.updated` | Any transaction state change |
| `catalog.changed` | Item added, edited, removed, or visibility changed |
| `item.updated` | Single item detail changed |
| `notification.new` | Any notification created for the user |
| `chat.message` | New chat message (pushed only to the two parties) |
| `chat.cleared` | Chat wiped on cancel/reject (prompts UI to close/clear) |
| `moderation.changed` | Report filed or reviewed |
| `admin.changed` | Any audited admin action |

---

## State Machine

```
Available ──(request)──► Pending
Pending   ──(approve)──► Approved   ──(QR handover)──► Borrowed ──(QR return)──► Completed
Pending   ──(reject / cancel)──────────────────────────────────────────────────► Available
Approved  ──(cancel)─────────────────────────────────────────────────────────── ► Available
```

`Pending` and `Approved` are pre-handover states and do **not** count as "Borrowed". The `active_borrowed` counter only increments after a successful QR scan.

---

## Running Tests

Backend tests are **integration tests** that hit a running seeded server over HTTP.

```powershell
cd backend
$env:REACT_APP_BACKEND_URL = "http://localhost:8000"
py -3.14 -m pytest                                              # all tests
py -3.14 -m pytest tests/test_utm_borrow.py::test_name -v      # single test
```

---

## Deployment

See **[DEPLOY.md](DEPLOY.md)** — frontend on Vercel, backend on Render, database on MongoDB Atlas.

---

## Architecture Notes

- **Strict owner isolation** — `/items/mine` filters by authenticated user id in the query *and* defensively re-filters the response list. No other user's listings can leak.
- **Atomic concurrency lock** — the Available → Pending transition uses `find_one_and_update` so two students can't request the same item simultaneously.
- **Session management** — each JWT carries a `jti` claim written to `user_sessions`; sessions can be listed and revoked individually from Account & Security settings.
- **Chat privacy** — messages are encrypted at rest; history is hard-deleted on transaction cancellation/rejection. Admin transcript access requires an open moderation report on that deal.
- **Multi-worker note** — the SSE broadcaster is in-process. For horizontal scaling, replace the internals of `realtime.py` with Redis pub/sub; the public API is unchanged.

See [CLAUDE.md](CLAUDE.md) for the full developer architecture reference.
