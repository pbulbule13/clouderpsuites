import asyncio
import logging

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send

from app.config import settings

logger = logging.getLogger(__name__)

PUBLIC_PATHS = {"/health", "/docs", "/openapi.json"}


class AuthMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope)

        if request.url.path in PUBLIC_PATHS or request.method == "OPTIONS":
            await self.app(scope, receive, send)
            return

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            response = JSONResponse(status_code=401, content={"error": "Missing token"})
            await response(scope, receive, send)
            return

        token = auth_header.removeprefix("Bearer ")
        try:
            idinfo = await asyncio.to_thread(
                id_token.verify_oauth2_token,
                token, google_requests.Request(), audience=settings.GOOGLE_CLIENT_ID,
            )
            scope.setdefault("state", {})
            scope["state"]["user_id"] = idinfo["sub"]
            scope["state"]["user_email"] = idinfo["email"]
            scope["state"]["user_name"] = idinfo.get("name", "")
        except Exception as exc:
            logger.warning("Token verification failed: %s", exc)
            response = JSONResponse(status_code=401, content={"error": "Invalid token"})
            await response(scope, receive, send)
            return

        if settings.ALLOWED_EMAILS and scope["state"]["user_email"] not in settings.ALLOWED_EMAILS:
            response = JSONResponse(status_code=403, content={"error": "Access denied"})
            await response(scope, receive, send)
            return

        await self.app(scope, receive, send)
