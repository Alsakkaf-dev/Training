# UTM Borrow — Test Credentials

All seeded users share the password: **Test1234**

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Student | alsakkaf@graduate.utm.my | Test1234 | Mohammed Alsakkaf, trust 4.8 |
| Student | muaz@graduate.utm.my | Test1234 | Muaz Ibne Ahmed, trust 4.5 |
| Student | ahmat@graduate.utm.my | Test1234 | Ahmat Mahamat, trust 5.0 |
| Admin/Moderator | admin@utm.my | Test1234 | Senior_Moderator (separate admin record) |

## Auth endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me
- POST /api/auth/forgot-password  (returns recovery_token in body — email is stubbed)
- POST /api/auth/reset-password

Auth scheme: JWT (HS256). Token returned in login/register body AND set as httpOnly cookie.
Frontend stores token in localStorage `utmb_token` and sends `Authorization: Bearer <token>`.

UTM email gate regex: ^[A-Za-z0-9._%+-]+@(graduate\.)?utm\.my$
