# UTM Borrow — Product Requirements & Build Log

## Problem Statement
Campus-wide circular resource-sharing platform for Universiti Teknologi Malaysia (UTM).
Students lend/borrow academic resources (lab tools, textbooks, formal wear, electronics,
engineering tools) with verified UTM identity, trust scores, and a real cryptographic
HMAC-SHA256 QR handover engine. Mobile-first responsive web app. All external services
(email verification, password email, push notifications) are STUBBED in-app; the QR engine
is the only real cryptographic feature.

## Stack
- Backend: FastAPI + Motor (MongoDB), JWT (HS256) auth, bcrypt. Modular routers.
- Frontend: React 18 (CRA) + react-router 6 + Tailwind, qrcode.react (display),
  html5-qrcode (live camera scan), @phosphor-icons/react.
- Design: Swiss / high-contrast (black #0D0F12 on #FAFAFA), Outfit + IBM Plex Sans,
  floating glassmorphic bottom tab bar. Status colors: Pending=amber, Borrowed=emerald,
  Cancelled/Overdue=red, Completed=blue.

## Architecture / Key Assumptions
- IDs are uuid4 hex stored in a `id` field (not ObjectId) for clean JSON serialization.
- Auth token returned in body + httpOnly cookie; frontend uses Bearer (localStorage utmb_token).
- Seed trust_scores are treated as historical averages (set directly); live recompute runs
  on new completions only.
- Photo "upload" = base64 data URL stored on the document (≤5MB), no external storage.
- Item delete = hard delete (blocked while Borrowed); admin removal = status Removed.

## Personas
- Student (borrower + lender simultaneously, contextual per transaction).
- Admin / Moderator (separate 1:1 admin record; Moderation Dashboard + enforcement).

## What's been implemented (2026-05-31) — ALL 4 PHASES
- **Phase 0** — Full data model (14 collections), idempotent seed (4 users, 8 items, 4
  in-flight transactions, 1 pending report), UTM-email-gated auth (register/login/recover),
  role system, app shell (Catalog / Dashboard / Profile tabs + notification center).
- **Phase 1** — Resource Catalog: item CRUD with photo upload, category/condition/college/
  faculty metadata, browse/search/filter, item availability state machine.
- **Phase 2** — Transactions & Handover (full fidelity): request/approve/reject/cancel with
  date validation, item locking, Transaction_State_Logs audit + in-app notifications; the
  HMAC-SHA256 QR engine (generate + live camera scan for handover & return) with Scan_Events
  + Lease_Cycles logging and ALL failure cases (Invalid_Token / Wrong_Transaction /
  Already_Used / Expired / State_Mismatch / Camera_Error); community moderation (report item,
  admin queue, dismiss / remove-item / suspend-user with Moderation_Actions + User_Suspensions).
- **Phase 3** — Trust Score recompute on completion (no self-rating), rating dialog triggered
  on return scan, User Activity Dashboard (Lending/Borrowing tabs, summary widgets, RED urgent
  -return badges for items due ≤24h or overdue), profile management (phone/photo, trust history).

## Test status
- Backend: 46/46 pytest cases PASSED (auth, catalog, transactions, every QR failure mode,
  moderation incl. permanent ban, ratings/trust, dashboard, notifications, profile).
- Frontend: e2e verified; 2 bugs found & fixed (borrow-request item_id; mobile notification
  drawer close). Re-verified borrow flow + urgent badge + drawer close.

## Backlog / Future (P1/P2)
- P1: Brute-force lockout on /api/auth/login (per auth playbook).
- P2: Seed extra always-available items so every demo user sees a non-empty catalog.
- P2: Client-side end>=start guard before POST (currently backend-validated).
- P2: Differentiate Suspended vs Banned message in login 403; expose num_ratings in profile.

## Mocked / Stubbed (per spec)
- Email verification, password-recovery email (token shown in UI), push notifications
  (in-app notification center). QR cryptography is REAL.
