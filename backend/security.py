"""Authentication: password hashing, JWT, and current-user dependencies."""
import os
import re
import secrets

import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException, Request

from database import db, new_id, now_utc, iso

JWT_ALGORITHM = "HS256"

UTM_EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@(graduate\.)?utm\.my$")


def is_valid_utm_email(email: str) -> bool:
    return bool(UTM_EMAIL_REGEX.match(email or ""))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str, jti: str | None = None) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
        "jti": jti or secrets.token_hex(16),
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


ADMIN_SESSION_MINUTES = 60


def create_admin_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "adm": True,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ADMIN_SESSION_MINUTES),
        "type": "admin_session",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def _extract_token(request: Request):
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return request.cookies.get("access_token")


async def _maybe_reinstate(user: dict) -> dict:
    """Reactivate timed suspensions that have expired."""
    if user.get("account_status") != "Suspended":
        return user
    susp = await db.user_suspensions.find_one(
        {"user_id": user["id"], "is_active": True},
        sort=[("created_at", -1)],
    )
    if not susp or not susp.get("end_at"):
        return user
    if iso(now_utc()) > susp["end_at"]:
        await db.users.update_one({"id": user["id"]}, {"$set": {"account_status": "Active"}})
        await db.user_suspensions.update_one({"id": susp["id"]}, {"$set": {"is_active": False}})
        user["account_status"] = "Active"
    return user


async def ensure_account_active(user: dict):
    user = await _maybe_reinstate(user)
    status = user.get("account_status", "Active")
    if status == "Banned":
        raise HTTPException(status_code=403, detail="Your account has been permanently banned.")
    if status == "Suspended":
        susp = await db.user_suspensions.find_one(
            {"user_id": user["id"], "is_active": True},
            sort=[("created_at", -1)],
        )
        detail = "Your account is currently suspended."
        if susp and susp.get("end_at"):
            detail = f"Your account is suspended until {susp['end_at'][:10]}."
        raise HTTPException(status_code=403, detail=detail)


async def register_session(user_id: str, jti: str, request: Request | None = None):
    """Upsert a session record keyed by jti so /auth/sessions can list active logins."""
    ua = request.headers.get("user-agent", "Unknown device") if request else "Unknown device"
    await db.user_sessions.update_one(
        {"jti": jti},
        {"$set": {
            "user_id": user_id,
            "device_info": ua[:200],
            "last_seen_at": iso(now_utc()),
        },
         "$setOnInsert": {
            "id": new_id(),
            "jti": jti,
            "created_at": iso(now_utc()),
            "revoked": False,
         }},
        upsert=True,
    )


async def get_current_user(request: Request) -> dict:
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid session. Please log in again.")
    jti = payload.get("jti")
    if jti:
        session = await db.user_sessions.find_one({"jti": jti})
        if session and session.get("revoked"):
            raise HTTPException(status_code=401, detail="Session revoked. Please log in again.")
        # Touch last_seen non-blockingly (fire-and-forget pattern)
        if session:
            await db.user_sessions.update_one({"jti": jti}, {"$set": {"last_seen_at": iso(now_utc())}})
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    await ensure_account_active(user)
    user.pop("_id", None)
    user.pop("password_hash", None)
    user["_jti"] = jti
    return user


async def get_current_admin(request: Request) -> dict:
    user = await get_current_user(request)
    admin = await db.admins.find_one({"user_id": user["id"], "is_active": True})
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required.")
    user["admin_id"] = admin["id"]
    user["admin_role"] = admin["role"]
    return user


async def get_admin_session(request: Request) -> dict:
    """Require an MFA-elevated admin session token (the admin portal gateway).

    The bearer token must be an `admin_session` JWT minted after a successful
    TOTP challenge AND still map to an active admin. Sensitive portal endpoints
    depend on this; the older /admin/reports* endpoints keep using
    get_current_admin for backward compatibility.
    """
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Admin session expired. Please verify again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid admin session.")
    if not payload.get("adm") or payload.get("type") != "admin_session":
        raise HTTPException(status_code=403, detail="Admin elevation required.")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    await ensure_account_active(user)
    admin = await db.admins.find_one({"user_id": user["id"], "is_active": True})
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required.")
    user.pop("_id", None)
    user.pop("password_hash", None)
    user["admin_id"] = admin["id"]
    user["admin_role"] = admin["role"]
    return user
