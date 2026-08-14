"""
Authentication module for VulnTracker.

Single source of truth for request authentication.

Design decision (see docs/roadmap.md Phase 0.1):
  - Supabase Auth issues JWTs (the frontend signs in via supabase-js).
  - Flask does NOT create tokens. It only VALIDATES incoming Supabase JWTs
    against Supabase's JWKS endpoint (RS256).
  - This removes the previous duplicate auth logic (Flask-JWT-Extended token
    creation) and gives us a single `require_auth` decorator for all routes.

The validated JWT payload is attached to `request.user` and contains:
  - sub   : Supabase user UUID
  - email : user email
  - role  : Supabase auth role ('authenticated')
  - app_metadata.role : application RBAC role (admin/analyst/viewer) — used by
    `require_role` in Phase 0.2.
"""

import os
from functools import wraps

import jwt
import requests
import structlog
from flask import jsonify, request

logger = structlog.get_logger()

# Cache the JWKS so we don't hit Supabase on every request.
_jwks_cache = None

# Application roles (must match the `role` column in the `users` table).
ROLE_ADMIN = "admin"
ROLE_ANALYST = "analyst"
ROLE_VIEWER = "viewer"
ALL_ROLES = (ROLE_ADMIN, ROLE_ANALYST, ROLE_VIEWER)


def _get_jwks():
    """Fetch and cache Supabase's JWKS (public signing keys)."""
    global _jwks_cache
    if _jwks_cache is None:
        supabase_url = os.getenv("SUPABASE_URL")
        if not supabase_url:
            raise RuntimeError("SUPABASE_URL must be set")
        url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


def _get_signing_key(kid):
    """Return the RSA public key matching the token's key id (kid)."""
    jwks = _get_jwks()
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)
    return None


def require_auth(f):
    """Validate the incoming Supabase JWT and attach its payload to request.user.

    Rejects requests with a missing, malformed, expired, or invalid token.
    """

    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required"}), 401

        token = auth_header.split(" ", 1)[1]
        try:
            kid = jwt.get_unverified_header(token).get("kid")
            key = _get_signing_key(kid)
            if key is None:
                return jsonify({"error": "Invalid token"}), 401

            payload = jwt.decode(
                token,
                key,
                algorithms=["RS256"],
                audience="authenticated",
            )
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception as e:
            logger.error("auth_error", error=str(e))
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return wrapper


def get_user_role():
    """Look up the authenticated user's application role from the `users` table.

    The `users` table uses an integer `id` and stores `email`, so we match by
    email (present in the JWT claims) rather than by the Supabase `sub` UUID.
    Returns one of ALL_ROLES, defaulting to ROLE_VIEWER if not found.
    """
    from app import supabase_service  # deferred import to avoid circular import

    email = (request.user or {}).get("email")
    if not email:
        return ROLE_VIEWER

    try:
        resp = (
            supabase_service.table("users")
            .select("role")
            .eq("email", email)
            .limit(1)
            .execute()
        )
        if resp.data and resp.data[0].get("role") in ALL_ROLES:
            return resp.data[0]["role"]
    except Exception as e:
        logger.error("role_lookup_error", error=str(e))

    return ROLE_VIEWER


def require_role(*allowed_roles):
    """Require the authenticated user to have one of the allowed roles.

    Wraps require_auth. Usage:
        @require_role('admin', 'analyst')
        def write_route(): ...
    """

    def decorator(f):
        @require_auth
        @wraps(f)
        def wrapper(*args, **kwargs):
            role = get_user_role()
            if role not in allowed_roles:
                return jsonify(
                    {"error": "Insufficient permissions for this action"}
                ), 403
            request.user_role = role
            return f(*args, **kwargs)

        return wrapper

    return decorator


def require_write():
    """Guard for write operations on mixed GET/POST routes.

    Returns None if the user may write (admin/analyst), otherwise a Flask
    response to return (403). Call at the top of POST/PUT/DELETE branches:
        resp = require_write()
        if resp: return resp
    """
    role = get_user_role()
    if role not in (ROLE_ADMIN, ROLE_ANALYST):
        return jsonify(
            {"error": "Insufficient permissions for this action"}
        ), 403
    request.user_role = role
    return None
