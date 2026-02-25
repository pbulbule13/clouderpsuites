import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.cloud import bigquery, firestore

from app.config import settings
from app.middleware.auth import AuthMiddleware
from app.middleware.error_handler import GlobalErrorMiddleware
from app.middleware.request_id import RequestIdMiddleware

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("talk2mydata")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Talk2MyData API")
    app.state.bq_client = bigquery.Client(project=settings.GCP_PROJECT)
    app.state.firestore_client = firestore.AsyncClient(project=settings.GCP_PROJECT)
    app.state.genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    logger.info("All clients initialized successfully")
    yield
    app.state.bq_client.close()
    await app.state.firestore_client.close()
    logger.info("Shutdown complete")


def create_app() -> FastAPI:
    app = FastAPI(title="Talk2MyData API", version="1.0.0", lifespan=lifespan)

    # Middleware stack (last added = outermost):
    # CORS -> GlobalError -> RequestId -> Auth -> App
    app.add_middleware(AuthMiddleware)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(GlobalErrorMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    from app.auth.router import router as auth_router
    from app.connectors.router import router as connectors_router
    from app.datasets.router import router as datasets_router
    from app.query.router import router as query_router

    app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(
        connectors_router, prefix="/api/v1/connectors", tags=["connectors"]
    )
    app.include_router(query_router, prefix="/api/v1/query", tags=["query"])
    app.include_router(datasets_router, prefix="/api/v1/datasets", tags=["datasets"])

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
