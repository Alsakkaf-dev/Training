# UTM Borrow — Auth & Flow Testing Notes

## Auth
- Seeded users password: `Test1234`. Admin: admin@utm.my.
- JWT HS256. Login/register return `{token, user}` and set httpOnly `access_token` cookie.
- Frontend uses `Authorization: Bearer <token>` (token in localStorage `utmb_token`).
- UTM email gate: only `@utm.my` / `@graduate.utm.my` accepted, else 400 "Only official UTM student emails are allowed."
- forgot-password returns `recovery_token` in the JSON body (email stubbed).

## Quick curl
```
API=http://localhost:8001
TOKEN=$(curl -s -X POST $API/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"alsakkaf@graduate.utm.my","password":"Test1234"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
curl -s $API/api/auth/me -H "Authorization: Bearer $TOKEN"
```

## QR engine (the only real crypto)
- POST /api/transactions/{id}/qr  (borrower) -> returns `qr_string` "UTMB.<payload_b64>.<hmac_sha256>"
- POST /api/scan {qr_string, purpose: Handover|Return} (lender) -> validates HMAC, transaction match, state.
- Failure results: Invalid_Token, Wrong_Transaction, Already_Used, Expired, State_Mismatch, Camera_Error.

## State machines
- Item: Available -> Pending (request) -> Borrowed (handover scan) -> Available (return scan). Reject/Cancel -> Available. Admin remove -> Removed.
- Transaction: Pending -> Approved -> Borrowed -> Completed. Pending->Rejected. Pending/Approved->Cancelled (blocked once Borrowed).
