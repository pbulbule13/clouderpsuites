import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.cloud import bigquery, firestore

from fastapi.responses import JSONResponse

from app.common.exceptions import Talk2MyDataError
from app.config import settings
from app.middleware.auth import AuthMiddleware
from app.middleware.error_handler import GlobalErrorMiddleware
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("talk2mydata")


EXPECTED_CONNECTORS = {"google_sheets", "csv", "excel", "json", "parquet"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Talk2MyData API")

    from app.connectors.registry import ConnectorRegistry

    missing = EXPECTED_CONNECTORS - ConnectorRegistry._connectors.keys()
    if missing:
        raise RuntimeError(
            f"Connector registry incomplete at boot: missing {sorted(missing)}. "
            f"Check side-effect imports in app/connectors/__init__.py."
        )
    logger.info("Connectors registered: %s", sorted(ConnectorRegistry._connectors))

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
    # CORS -> SecurityHeaders -> GlobalError -> RequestId -> Auth -> App
    app.add_middleware(AuthMiddleware)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(GlobalErrorMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
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

    # Centralized exception handlers for consistent error responses
    ERROR_STATUS_CODES = {
        "connector_error": 400,
        "dataset_not_found": 404,
        "dataset_limit_exceeded": 422,
        "row_limit_exceeded": 422,
        "column_limit_exceeded": 422,
        "query_limit_exceeded": 429,
        "sql_validation_error": 400,
        "spreadsheet_not_found": 404,
        "spreadsheet_access_denied": 403,
        "spreadsheet_quota_exceeded": 429,
        "unsupported_file_type": 415,
        "file_parse_error": 400,
        "file_format_error": 400,
    }

    @app.exception_handler(Talk2MyDataError)
    async def talk2mydata_error_handler(request, exc: Talk2MyDataError):
        status = ERROR_STATUS_CODES.get(exc.code, 400)
        return JSONResponse(
            status_code=status,
            content={"error": exc.code, "message": exc.message},
        )

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
