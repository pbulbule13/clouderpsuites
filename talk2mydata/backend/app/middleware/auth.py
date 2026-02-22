import asyncio
import logging

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings

logger = logging.getLogger(__name__)

PUBLIC_PATHS = {"/health", "/docs", "/openapi.json"}


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in PUBLIC_PATHS or request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"error": "Missing token"})

        token = auth_header.removeprefix("Bearer ")
        try:
            idinfo = await asyncio.to_thread(
                id_token.verify_oauth2_token,
                token, google_requests.Request(), audience=settings.GOOGLE_CLIENT_ID,
            )
            request.state.user_id = idinfo["sub"]
            request.state.user_email = idinfo["email"]
            request.state.user_name = idinfo.get("name", "")
        except Exception as exc:
            logger.warning("Token verification failed: %s", exc)
            return JSONResponse(status_code=401, content={"error": "Invalid token"})

        return await call_next(request)
