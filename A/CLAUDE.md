# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

UTM Borrow — a campus peer-to-peer item lending app for Universiti Teknologi Malaysia. FastAPI + MongoDB backend, React (CRA) + Tailwind frontend, with QR-signed handovers and real-time updates over Server-Sent Events.

## Commands

The Windows launchers are the normal way to run everything:
- **`START APP.bat`** — kills stray node, starts backend (`uvicorn ... --reload`, port 8000) and frontend (`npm start`, port 3000). Both hot-reload on save.
- **`STOP APP.bat`** — stops them.

Run pieces manually:
- Backend: `cd backend && py -3.14 -m uvicorn server:app --reload` (requires local MongoDB on :27017; seeds on startup).
- Frontend: `cd frontend && npm start`.
- Frontend build: `cd frontend && npm run build` (CRA does not fail on lint warnings locally). **Vercel sets `CI=true`, which promotes every ESLint warning to a build-breaking error** — unused imports and missing `useEffect`/`useCallback` deps fail the deploy even though `npm start` and a plain local build are silent. Reproduce the deploy gate before pushing: `CI=true npm run build` (PowerShell: `$env:CI="true"; npm run build`).
- Install deps: backend `py -3.14 -m pip install -r backend/requirements.txt`; frontend `cd frontend && npm install`. **SSE real-time needs no extra backend dependency** — it streams over plain HTTP.

The Python interpreter for **local dev** is the Windows launcher **`py -3.14`** (not `python`) — which is why recovered bytecode is `*.cpython-314.pyc`. **Deployment runs Python 3.12** (`backend/Dockerfile` is `python:3.12-slim`; `render.yaml` pins `PYTHON_VERSION=3.12.6`), so avoid 3.13+/3.14-only syntax in shipped code.

### Tests (backend integration)
`backend/tests/` are **integration tests that hit a running, seeded server over HTTP** (via `requests`), not unit tests. `conftest.py` defaults `BASE_URL` to a remote preview URL, so **always point it at your local server**:

```
cd backend
$env:REACT_APP_BACKEND_URL="http://localhost:8000"   # PowerShell
py -3.14 -m pytest                                    # all
py -3.14 -m pytest tests/test_utm_borrow.py::test_name -v   # single test
```

They log in as seeded accounts (password `Test1234`): `alsakkaf@graduate.utm.my`, `muaz@…`, `ahmat@…`, and admin `admin@utm.my`. Lint: `ruff check backend` (a `.ruff_cache` exists).

## Architecture

### Backend (`backend/`)
- **`server.py`** — FastAPI app; CORS from `CORS_ORIGINS`; includes all routers under `/api`; on startup runs `ensure_indexes()` then idempotent `seed()`.
- **`database.py`** — single `motor` async client (`db`). Every document is keyed by a **string `id` (uuid4 hex)**, never Mongo's `_id`; `clean()` strips `_id` before returning. Use `new_id()`, `now_utc()`, `iso()`.
- **`security.py`** — bcrypt + JWT (HS256). Three token-minting/auth tiers: `create_access_token` (7-day user token) + `get_current_user`; `get_current_admin` (any active admin); and `get_admin_session` (an **MFA-elevated** `admin_session` token from `create_admin_token`, ~60 min — the gateway for the sensitive admin portal). Enforces UTM email regex on register and gates by `account_status` (Active / Suspended / Banned), auto-reinstating expired timed suspensions.
- **Routers** (`routers/`): `auth, items, transactions, qr, ratings, profile, dashboard, moderation, events, admin, chat, support, saved`. `profile.py` also owns the `/notifications` endpoints.
- **`routers/saved.py`** — bookmark/save feature. `POST /items/{id}/save`, `DELETE /items/{id}/save`, `GET /items/{id}/save` (status), `GET /saved` (user's full saved list with enriched item + owner data). Stores to `saved_items` collection. Registered last in `server.py`; the `/items/{id}/save` sub-path does not conflict with `items.router`'s `/{id}` because path-param matching doesn't cross `/`.
- **`notifications.py`** (root, not a router) — helper module imported by routers to create and push in-app notifications. Defines `VALID_TYPES` (all notification type strings) and `create_notification()`; calls `broadcaster.publish_to()` so new alerts appear live in the client without a poll.
- **`mfa.py`** — TOTP step-up for the admin portal (`generate_secret`, `provisioning_uri`, `verify`, `current_code`, `dev_hint_enabled`). Secrets live on `admins.mfa_secret`.
- **`crypto_box.py`** — dependency-free symmetric encryption (HMAC-SHA256 CTR keystream + auth tag, keyed by env `CHAT_SECRET`, falling back to `JWT_SECRET`). Used to encrypt chat messages at rest so the server can decrypt a transcript only when moderation policy allows. `encrypt()` / `decrypt()` round-trip; tampered tokens return a sentinel string, never raise.
- **`tx_common.py`** — `enrich_transaction()` joins item + borrower + lender + lease and computes overdue/`due_within_24h` flags; `recompute_trust_score()` averages a user's ratings (stored in `user_ratings`) into `users.trust_score`; `log_transition()` appends to `transaction_state_logs`; `compute_lease_flags()` returns `(is_overdue, due_soon, overdue_days)`.
- **`qr_engine.py`** — HMAC-SHA256 signed, time-limited QR tokens (`QR_HMAC_SECRET`); verified in `routers/qr.py`.
- **`seed.py`** — idempotent demo data: 4 users (3 students + 1 admin), 8 items, transactions in every state (Pending / Approved+QR / Borrowed+active lease / Completed+ratings), and one pending report. Guard checks `matric_no: "A23CS4026"` (the unique-indexed field) — **not** email — to detect an already-seeded DB.

### Admin portal (MFA-gated)
`routers/admin.py` (prefix `/api/admin`) is a strict RBAC surface layered on top of the normal peer-to-peer flow. Flow: enrol/elevate via `/auth/elevate/start` + `/auth/elevate` (TOTP) using the normal admin token → mint an `admin_session` token → every sensitive endpoint depends on `get_admin_session`. The older `/admin/reports*` moderation endpoints (in `moderation.py`) still use `get_current_admin` for back-compat. **Every mutating admin action is written to the `admin_audit` collection** via `log_admin_action()` and broadcast as `admin.changed`. Frontend: the elevated token is stored separately in `localStorage["utmb_admin_token"]` and sent by the dedicated **`adminApi`** axios client (`lib/api.js`); on 401/403 it auto-drops the token and fires an `admin-deauth` event so `AdminLayout` re-gates.

- **Isolated admin frontend**: admin pages live under `pages/admin/` with their own `AdminLayout` (mobile-first: a fixed glass **bottom tab bar** — Overview · Inbox · Deals · Users · More — plus a **minimal top row** with the profile avatar left → `/admin/profile` and an alerts bell right; **no student chrome**). Secondary tools (Overdue, Reports, Scan, Audit) and account actions live in a "More" bottom-sheet `Modal`. `AdminOverview` is the index route; `AdminProfile` (`/admin/profile`) is the admin's self-service page. App.js's `StudentOnly` guard + `landingPath()` **confine admins to `/admin`** — they are redirected out of the student app and never see its bottom nav.
- **Admin self-service**: `GET /admin/me` (role, permissions, MFA status, alert prefs, accountability stats), `PATCH /admin/me/alerts` (Email/SMS opt-in for high-priority reports), `GET /admin/me/activity` (this admin's own audit trail). Per-role permission lists come from `ROLE_PERMISSIONS` in `admin.py`.
- **Lock vs. Log out** (easy to confuse): **Lock** drops only `utmb_admin_token` (re-gates MFA; the user stays signed into the app), while **Log out** also calls AuthContext `logout()` and clears `utmb_token`, then redirects to `/login`. `AdminLayout` passes both handlers down via `<Outlet>` context (`{ refreshGate, lock, logout, session }`), so pages like `AdminProfile` use `useOutletContext()` rather than re-implementing them.
- **Hard (permanent) deletes**: `DELETE /admin/items/{id}` and `DELETE /admin/users/{id}` *permanently* wipe a listing/user and cascade-purge every linked record via `_purge_transactions()`. These are **distinct** from the soft `POST /admin/items/{id}/remove`, which only flips `availability_status` to `Removed`. Both block deleting admin/self accounts and are audited.

### Chat, ratings lifecycle, and support
- **`routers/chat.py`** — a chat **session is tied to a transaction** and only becomes `Active` on **bidirectional acceptance** (lender approved → tx status `Approved`/`Borrowed`); it `Closed`s on `Completed`/`Cancelled`/`Rejected`. Messages are stored encrypted via `crypto_box` and are strictly isolated to the two parties. Filing a report (`/by-transaction/{tx}/report`) writes a moderation-schema report carrying `transaction_id`, which later **unlocks report-gated admin transcript decryption** (`/chat/admin/by-transaction/{tx}`).
- **Rating windows** (`routers/ratings.py`, `_rating_eligibility`): **Borrower→Lender** allowed once accepted (`Approved`/`Borrowed`/`Completed`); **Lender→Borrower** only after QR-verified `Completed`. Cancelled/Rejected revoke eligibility. One rating per rater per transaction.
- **`routers/support.py`** — `POST /help` opens a help ticket and pings admins in real time; `GET /admin/alerts` is the unified admin inbox; `GET /admin/fraud` runs explainable heuristics; `POST /admin/items/{id}/remove` is admin item takedown. Admin profiles are hidden — `profile.py`'s `GET /profile/{id}` 404s for active admins.

### Core domain state machine
An item's `availability_status` is driven by its transaction's `status`, and the two must stay consistent:
- Request: item `Available → Pending` via an **atomic** `find_one_and_update` (concurrency lock — two students can't request the same item).
- Lender approves (`Pending → Approved`) or rejects/cancels (item back to `Available`).
- **QR handover scan** (lender scans borrower's QR in `routers/qr.py`): `Approved → Borrowed`, item → `Borrowed`, opens a `lease_cycles` row.
- **QR return scan**: `Borrowed → Completed`, item back to `Available`, both parties prompted to rate.

Mongo collections: `users, admins, items, transactions, transaction_state_logs, qr_tokens, scan_events, lease_cycles, user_ratings, reports, notifications, user_sessions, user_suspensions, admin_audit, moderation_actions, penalties, chat_sessions, chat_messages, help_tickets, saved_items`.

### Real-time (Server-Sent Events)
Server→client push only; all actions still go through REST.
- **`realtime.py`** — in-process `broadcaster` (pub/sub keyed by user id). `publish(type, payload)` → all clients; `publish_to([user_ids], type, payload)` → targeted. Single uvicorn worker; for multi-worker, swap the internals for Redis pub/sub (the public API stays the same).
- **`routers/events.py`** — `GET /api/events?token=JWT` SSE stream (EventSource can't send headers, so the JWT is a query param). Heartbeats every 20s.
- Event types: `notification.new`, `catalog.changed`, `item.updated`, `transaction.updated`, `moderation.changed`, `admin.changed`, `chat.message`, `chat.cleared`. The frontend only listens to types in the `EVENT_TYPES` allowlist in `src/lib/realtime.js` — **add a new type there too, or the client silently ignores it.**
- Frontend: **`src/lib/realtime.js`** — one shared EventSource; `useRealtimeEvent(type, handler)` and `useRealtimeStatus()`. Connected in `context/AuthContext.js` (also pushes a toast + updates the unread badge on `notification.new`).

### Frontend (`frontend/src/`)
- **`App.js`** — routes + `Protected` / `PublicOnly` / `AdminOnly` / `StudentOnly` guards; everything is wrapped in `ToastProvider` → `AuthProvider`. **Student pages are nested under one `components/Layout.js` parent route** (sticky header + floating bottom nav, rendered via `<Outlet>`) — a page added outside that parent route gets no nav. `StudentOnly` redirects admins to `/admin`; `landingPath(user)` sends admins to `/admin` and students to `/home` on login.
- **`/catalog` is retired** — it now redirects to `/home` via `<Navigate>`. The old `Catalog.js` page is no longer a live route. All discovery and filtering lives in `Home.js`.
- **`context/AuthContext.js`** — auth state; JWT stored in `localStorage["utmb_token"]`; bootstraps via `/auth/me`; owns realtime connect + unread count.
- **`lib/api.js`** — **everything here is a named export; there is no `default` export.** Two axios instances both at `baseURL = REACT_APP_BACKEND_URL + "/api"`: `api` (normal client, injects `utmb_token`); **`adminApi`** (injects `utmb_admin_token`, required for `get_admin_session` endpoints). Also exports `formatApiError`, `setAdminToken`, `ADMIN_TOKEN_KEY`. **Always `import { api } from ".../lib/api"`** — a default import compiles under `npm start` but breaks the Vercel build.
- **`lib/format.js`** — `humanizeType(value)` converts backend enum strings to readable labels. Use this wherever notification type strings are displayed.
- **`hooks/useRouteRefresh.js`** — `useRouteRefresh(loadFn, routePath)` re-runs a data loader when the route matches and when the user returns to the tab (via `visibilitychange`). Use it on any page whose data can go stale while navigating away.

### Student page structure

**Bottom nav** (4 tabs): Home · Lend · Activity · Profile. The old "Borrow" (Catalog) tab has been removed.

Page folders under `pages/`:
- `pages/Transaction/` — `Home.js` (unified discovery hub), `PopularAll.js` (`/home/popular`), `NearbyAll.js` (`/home/nearby`), `Chat.js`, `TransactionDetail.js`, `Scanner.js`, `Notifications.js`, `TransactionHistory.js`, `Dashboard.js`
- `pages/Resource/` — `ItemDetail.js`, `ItemForm.js`, `Lend.js`
- `pages/identity/` — `Login.js`, `Register.js`, `Profile.js`, `PublicProfile.js`, `SettingsHub.js`, `SettingsSecurity.js`, `ForgotPassword.js`, `ResetPassword.js`, `Reputation.js`, `HelpSupport.js`, `NotificationPreferences.js`, `Governance.js`, `AuthShell.js`

### Key page behaviours to know

**`Home.js`** is the single discovery surface:
- The `AnimatedSearchBar` component cycles through placeholder text (`Search laptops…`, `Find sports equipment…`, etc.) using `setInterval` when the input is empty. The search itself is debounced 250ms against `GET /items?q=`.
- The `CategoryRow` component renders Airbnb-style emoji + label pills (defined in `CATEGORY_META` at the top of `Home.js`) that filter in-place. Tapping a category sets `filterCategory` and triggers the filtered-feed `useEffect`. The pill at the top of the category list is always "All".
- The advanced filter button (`SlidersHorizontal`) toggles a separate `AnimatePresence` panel with Condition/College/Faculty selects — distinct from the category pill row.
- `activeFilterCount` drives the badge on the filter button. When the panel is closed but filters are active, removable pill chips appear below the search bar.
- "See all →" on "Most popular" → `/home/popular`; "See all →" on "Near you" → `/home/nearby`.

**`AuthShell.js`** renders a shared tab switcher ("Log In" / "Sign Up") at the top of every auth card. Both `Login.js` and `Register.js` use it — the active tab is set by a `mode` prop (`"login"` | `"register"`). Tabs are `<Link>` to `/login` and `/register`; no modal.

**`ItemDetail.js`** — the borrow request is handled by the `BorrowRequestCard` sub-component in the same file. It owns a custom inline calendar (built without any date-picker library) with range highlighting, a duration pill, and a CTA button that shows the selected range. The bookmark (save) button lives on the hero image bottom-right and calls `POST/DELETE /items/{id}/save`; it is hidden for the item's owner.

**`ItemForm.js`** — 5-step wizard at `/items/new` and `/items/:id/edit`. **Layout's top header and bottom nav are suppressed on these routes** (detected in `Layout.js` via path check) because the form has its own sticky top bar (back button + progress dots + progress bar) and a fixed CTA bar at the bottom. Structure: sticky top bar → sticky step heading (steps 0–3 only, sits outside the `overflow-y-auto` scroll container so it never scrolls away) → `AnimatePresence` slide container → fixed CTA. The "Ready to launch" review step (step 4) keeps its heading inside the scroll. Draft state is persisted to `sessionStorage` under `utmb_item_draft`.

**`Profile.js`** contains several self-contained sub-components:
- `StatBox` — animated hover-lift stat tile (Reputation / Lent / Borrowed count).
- `QuickAction` — icon-circle action button (Settings, Alerts, Reputation); primary variant uses `bg-brand-gradient`.
- `RatingDistribution` — star breakdown bar chart rendered above individual reviews using `ProgressBar` from `ui.js`.
- `TrustRing` from `ui.js` is used here: it's an SVG circular gauge that animates `strokeDashoffset` on mount — color shifts red → indigo → green based on score.
- Saved Items section fetches `GET /saved` and renders a horizontal scroll. Placed above the Ratings section.

**`TransactionDetail.js`** contains several self-contained sub-components:
- `CountdownTimer` — a live `setInterval` countdown (updates every minute) that shows "Return in Xh Ym" or "Overdue by …" for Borrowed status. Rendered inside the status timeline card.
- `StatusTimeline` — step nodes now use per-step icons (Hourglass / CheckCircle / Package / Sparkle); the active node pulses with a `boxShadow` Framer Motion animation.
- `NextStepBanner` — gradient-to-transparent `bg-gradient-to-br` background, pulsing icon; 8 configs total (role × status).
- `LenderDecision` — icon circles tilt on hover (`rotate: -8` / `rotate: 8`) via `whileHover`.
- `QRModal` — entry shake animation on the QR icon, spring-scaled QR code reveal. Full-screen `AnimatePresence` overlay at `z-[200]`.
- `RatingModal` — Avatar with amber star badge overlay; 42px star buttons with hover/tap scale; quick-select tag chips; optional textarea.

**`Notifications.js`** — notifications are grouped into **Today / Yesterday / Earlier** date buckets (computed client-side). `typeStyle()` returns `{ bg, text, ring, bar }` — the `bar` value is used for the gradient left accent on unread cards (`.notif-unread-bar` CSS class). `iconForType()` maps notification types to Phosphor icons. The tab bar includes an unread dot on inactive tabs.

**`Chat.js`** — message bubbles use `.bubble-mine` / `.bubble-other` CSS classes defined in `index.css` (rounded corners with tail on the last message of each group). The counterparty avatar only renders on the last message of their consecutive group (Telegram-style grouping). A scroll-to-bottom FAB (`ScrollFab`) appears when the user scrolls up more than 80px, and accumulates an unread count for messages that arrive while scrolled away. The composer send button animates opacity based on whether the text field has content.

**`ExploreCards.js`** — exports four card variants:
- `PopularCard` — 220×280px vertical card for horizontal scroll sections. Includes an emoji category badge (top-left), trust badge (top-right), and a card-shine overlay on hover.
- `ListCard` — full-width horizontal card. Thumbnail has an emoji overlay badge bottom-left. Used in the "Near you" section and search/filter results.
- `FeaturedCard` — full-width 200px tall spotlight card with a "Featured" gradient badge. Used for curated content.
- `GridCard` — compact `aspect-[3/4]` card for grid layouts. No save/heart button on any card variant — the save interaction lives exclusively on `ItemDetail`.

**`Layout.js`** — the header's right side includes an `Avatar` that links to `/profile` plus the notification bell. The notification quick-drawer (`NotificationDrawer`) slides in from the right and shows up to 12 recent notifications with a "View all" footer CTA linking to `/notifications`. Bell badge uses `AnimatePresence` for a spring pop-in animation. **ItemForm routes (`/items/new`, `/items/:id/edit`) suppress both the top header and bottom nav** so the form renders full-screen without student chrome.

### Design system

#### Color palette
The brand is **deep blue** (`#1E3A8A` = `brand-900`), not indigo. Key values:

| Token | Value | Usage |
|---|---|---|
| `brand-900` | `#1E3A8A` | Primary brand, active states, CTA buttons |
| `brand-600` | `#2563EB` | Interactive accents |
| `brand-500` | `#3B82F6` | Lighter brand tint |
| `brand-50` | `#EFF6FF` | Ice blue, backgrounds, `elevation-3` |
| `canvas` | `#F8FAFC` | App background |
| `surface` | `#FFFFFF` | Cards, modals |
| `ink` | `#0F172A` | Primary text |
| `muted` | `#64748B` | Secondary text, placeholders |
| `status.available` | `#10B981` | Available badges (emerald) |
| `status.pending` | `#F59E0B` | Amber |
| `status.cancelled/overdue` | `#EF4444` | Red |

CSS variables in `:root`: `--brand: #1E3A8A`, `--brand-light: #3B82F6`, `--canvas: #F8FAFC`.

#### Tokens (`tailwind.config.js`)
- **Shadows**: `card-hover` (elevated version of `card`), `glow-lg`, `glow-warm`, `glow-success`, `glow-danger`, `inner-brand`, `inner-soft`. All `glow*` shadows use `rgba(37,99,235,…)` (brand blue).
- **Gradients**: `brand-gradient` (`#3B82F6 → #1E3A8A`), `success-gradient`, `danger-gradient`, `amber-gradient`, `dark-gradient`, `mesh-brand`, `mesh-warm`, `hero-overlay`, `hero-overlay-lg`, `card-shine`.
- **Keyframes / animations**: `fade-down`, `scale-in`, `slide-in-left`, `slide-up-fade`, `float-gentle`, `pulse-brand`, `bounce-gentle`, `rotate-slow`, `hero-ken-burns`, `shine`, `wave`, `draw-circle`.
- **Radius**: `5xl` (2.5rem), `6xl` (3rem).
- **Easing**: `ease-spring`, `ease-overshoot`, `ease-smooth` transition timing functions.

#### CSS utilities (`index.css`)
Glass surface variants: `glass` (standard), `glass-strong` (heavier blur for headers), `glass-dark` (dark overlay), `glass-brand` (brand-blue tinted), `glass-card` (for card overlays).

Text gradient variants: `text-gradient` (blue), `text-gradient-warm` (amber→red), `text-gradient-cool` (blue→cyan), `text-gradient-success` (emerald).

Interaction utilities: `card-lift` (CSS-only hover elevation + active scale), `btn-shine` (shimmer sweep on hover via `::after` pseudo-element).

Chat bubble classes: `bubble-mine` (blue gradient `#3B82F6 → #1E3A8A`, tail bottom-right), `bubble-other` (white bordered, tail bottom-left). Grouped variants are `bubble-mine-grouped` / `bubble-other-grouped`.

Category pill: `.category-pill` — flex + gap + padding + transition base class for the Airbnb-style emoji + label pills in `Home.js`.

Notification: `.notif-unread-bar` — absolute-positioned brand-blue gradient bar (3.5px wide) on the left edge of unread notification cards.

#### Motion (`lib/motion.js`)
Easing: `easeOut`, `easeSmooth`, `easeOvershoot`. Springs: `spring`, `softSpring`, `snappySpring`, `bouncySpring`, `slowSpring`.

Page variants: `pageVariants` (fade+slide-up), `pageSlideLeft`, `pageSlideRight` (directional navigation).

List items: `riseItem` (standard), `riseItemFast`, `slideItem` (horizontal list entry).

Containers: `staggerContainer`, `staggerFast`, `staggerSlow`.

Hero: `heroVariants` / `heroChild` for large header sections.

Appearance: `popIn` (bouncy scale-in), `scaleIn`, `fadeIn`, `expandVariants` (accordion height).

Modals: `sheetVariants`, `backdropVariants`, `drawerVariants`, `drawerLeftVariants`.

Feedback presets: `tap`, `tapSmall`, `tapMicro`, `liftHover`, `liftHoverSm`.

#### Component library (`components/ui.js`)
Notable exports:
- **`TrustRing`** — `{ score, size, strokeWidth }` — SVG circular gauge; color shifts red→indigo→green; animates `strokeDashoffset` on mount with a 1.2s spring.
- **`ProgressBar`** — `{ value, max, color, animated }` — animated fill bar; color variants: `brand`, `success`, `amber`, `danger`.
- **`CountUp`** — `{ to, duration }` — animates a number from 0 to `to` using `requestAnimationFrame`.
- **`Divider`** — optional `label` prop renders a labeled horizontal rule.
- **`InfoRow`** — `{ icon, label, value }` — a key-value row with bottom border.
- **`Button`** — variants: `dark`; sizes: `xs`, `xl`; adds `whileHover={{ y: -1 }}` lift.
- **`Avatar`** — `ring` boolean prop adds `ring-2 ring-brand-200 ring-offset-1`.
- **`Modal`** — `size` prop (`"sm"` | `"md"` | `"lg"`) controls max-width; Escape key is trapped via `useEffect`.
- **`StarRating`** — editable mode tracks hover state locally to show preview fills.

**Two-tier modal pattern**: use `Modal` from `ui.js` for simple overlays; build a custom `AnimatePresence` overlay (backdrop + spring-animated sheet, `rounded-t-4xl sm:rounded-4xl`, drag handle, `z-[200]`) when you need full-bleed content or scroll-independent close positioning — see `QRModal` and `RatingModal` in `TransactionDetail.js`.

CTA buttons use the pill-with-leading-icon-circle pattern: a `w-10 h-10 bg-white/20 rounded-full` icon circle on the left, text absolutely centered over the full button width. See `Login.js` and `BorrowRequestCard` in `ItemDetail.js`.

## Deployment
See **`DEPLOY.md`** for the full guide. The two services deploy independently and are wired together by env vars + CORS:
- **Backend → Render** (`render.yaml` Blueprint): `rootDir: backend`, build `pip install -r requirements.txt`, start `uvicorn server:app --host 0.0.0.0 --port $PORT`. Secrets (`MONGO_URL`, `JWT_SECRET`, `QR_HMAC_SECRET`, `CORS_ORIGINS`) are `sync: false` and must be set in the Render dashboard. `MONGO_URL` must be a real Atlas SRV string — the `<db_password>` placeholder crashes the driver.
- **Frontend → Vercel** (`frontend/vercel.json`): CRA preset, SPA rewrite, `GENERATE_SOURCEMAP=false`. Set **`REACT_APP_BACKEND_URL`** (no trailing `/api`) in Vercel env; baked in at build time, so changing it requires a redeploy.
- **CORS**: `CORS_ORIGINS` on Render must list the **exact** Vercel origin — `https://`, no trailing slash. Use the stable production domain, not the per-deploy preview URL. A mismatch causes a `400` on the preflight OPTIONS request, showing as "CORS error" in DevTools with no `err.response` on the client (which `formatApiError` renders as "Something went wrong. Please try again.").
- **Single instance only** — the in-process SSE `broadcaster` is per-process. Scaling to multiple workers silently drops cross-client events until `realtime.py` is swapped for Redis pub/sub.

## Conventions
- **Validate enums server-side**: `CATEGORIES / CONDITIONS / COLLEGES / FACULTIES` live in `routers/items.py` and are checked on every item write. Current values: `CATEGORIES = ["Electronics", "Books", "Sports", "Tools", "Camera", "Music", "Gaming", "Clothing", "Other"]`; `CONDITIONS = ["New", "Good", "Fair", "Poor"]`. **The frontend `CATEGORY_META` and `CONDITION_META` in `ItemForm.js` must stay in sync with these lists** — a mismatch causes all non-matching selections to be rejected with a 400.
- **Owner-scoped list endpoints** (e.g. `/items/mine`): filter by `user["id"]` in the Mongo query **and** re-filter the returned list defensively — never rely on the query alone (a prior regression leaked other owners' listings). Mirror the same guard client-side.
- **`data-testid` everywhere**: all interactive and key informational elements carry a kebab-case, role-based `data-testid`. Preserve them when editing.
- **Env files**: `backend/.env` (`MONGO_URL, DB_NAME, JWT_SECRET, QR_HMAC_SECRET, CORS_ORIGINS`; optional `CHAT_SECRET`, `ADMIN_MFA_DEV_HINT=1`) and `frontend/.env` (`REACT_APP_BACKEND_URL`). Both `.env.example` files exist as templates. **Both `.env` files are gitignored.** `database.py`/`security.py`/`qr_engine.py` read several via bare `os.environ[...]` (no defaults) — a missing `backend/.env` crashes startup with `KeyError: 'MONGO_URL'`.
- **Recovering deleted source from bytecode**: if a `.py` is missing, its `__pycache__/*.cpython-314.pyc` is the ground truth — load with `marshal` (skip the 16-byte 3.14 header), disassemble with `dis`, reconstruct. Frontend has no equivalent; the production `build/` bundle is the only record.
- **Merge-conflict / build hazards**: the root `_resolve_ours.py` helper only scans `backend/` and `frontend/src/`, so root-level configs (e.g. `frontend/tailwind.config.js`) can retain unresolved `<<<<<<<` markers and silently break the CRA build with a file-less `SyntaxError`. When a build fails with no path, scan the whole tree for conflict markers. An automated watcher in this environment may auto-commit with AI-generated (sometimes inaccurate) messages — verify `git log`/diffs rather than trusting commit subjects.
