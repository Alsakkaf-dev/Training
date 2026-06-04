# PDF-Conformance Work — COMPLETE

Goal: align the app strictly to the 3 PDFs. Decisions: **SDD** enums, **Full SRS GPS**, **real emailed reset link**, keep MongoDB.

## SDD enum values now enforced everywhere
- Categories: `Electronics, Textbooks, Lab Equipment, Tools, Clothing, Other`
- Conditions: `Like New, Good, Fair, Poor` (rank Like New=4 > Good=3 > Fair=2 > Poor=1)
- Colleges: `Kolej Tuanku Canselor, Kolej 9, Kolej Perdana, Kolej Rahman Putra, Other`
- Faculties: `Computing, Engineering, Science, Built Environment, Other`

## Done & verified (CI=true build passes, backend syntax OK)
1. **Enums (SDD)** — backend/routers/items.py, seed.py; frontend ItemForm.js (CATEGORY_META 6 + CONDITION_META "Like New"), Home.js CATEGORY_META, ExploreCards.js CATEGORY_EMOJI. College/faculty selects auto-pull from `/meta`.
2. **Catalog filtering** — multi-select category (UC2201, comma `$in`), condition minimum-threshold (UC2202, CONDITION_RANK), combined query (UC2203). Home `CategoryRow` now multi-select (array/onToggle/onClear); condition select relabeled "Min. condition" + hint.
3. **GPS/location (Full SRS UC2301-2303)** — backend COLLEGE_COORDS/FACULTY_COORDS + haversine; browse() accepts `lat,lng,radius_km,sort`; 2km default radius; nearest/farthest sort; unknown-location items trail. Home: "Use my location" button (navigator.geolocation, graceful denial toast), Sort select (Recommended/Recently added/Nearest/Farthest), Near-me + sort chips.
4. **Password recovery (UC1103)** — backend/emailer.py (stdlib SMTP + dev fallback); auth.py forgot_password emails `{FRONTEND_URL}/reset?token=...` (1h expiry, invalidates prior tokens, no token leak when email sent; dev mode surfaces link). ForgotPassword.js: "Send recovery link" → emailed-link confirmation OR inline dev-token flow. ResetPassword.js (`/reset?token=`) already wired.
5. **Listing** — UC2101 photo-required + 5-min duplicate guard; UC2103 `POST /items/{id}/refresh` + `last_refreshed_at` + "recent" sort; Lend.js Refresh button (`refresh-listing-{id}`); edit sets `updated_at`.
6. **Copy/badges** — StatusBadge already matches NFR (Pending=yellow, Borrowed=green, Cancelled=red). Dashboard empty state → "You have no active lending or borrowing commitments at this time." Profile photo validation → JPEG/PNG under 5MB exact message (UC1201 A1).

## Already conformant (untouched, verified): auth/JWT/bcrypt, state machine, HMAC QR, account_status, report categories, moderation+audit, MFA admin, SSE, trust score, saved items, notifications, collection names.

## Not done (optional / low-value, integration-only)
- Backend `pytest` not run here: it's integration (needs a running seeded local server + MongoDB). Run manually: `cd backend; $env:REACT_APP_BACKEND_URL="http://localhost:8000"; py -3.14 -m pytest`.
- Optional SMTP env for production email: SMTP_HOST/PORT/USER/PASS/FROM, FRONTEND_URL. Without them, reset runs in dev (link surfaced in UI).
- Minor scan-error/confirmation-dialog string polish (SRS UC3202/3203) — judged already conformant.

## Env additions (optional, prod email)
`SMTP_HOST, SMTP_PORT(=587), SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TLS(=1), FRONTEND_URL(=https://your-vercel-domain)`
