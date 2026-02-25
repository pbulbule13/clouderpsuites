import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.connectors.ports import ConnectorConfig
from app.connectors.registry import ConnectorRegistry
from app.connectors.schemas import ConnectRequest, ConnectResponse, DiscoverResponse
from app.connectors.service import ConnectorService
from app.common.exceptions import (
    ConnectorError,
    RowLimitExceededError,
    ColumnLimitExceededError,
)
from app.dependencies import get_connector_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/connect", response_model=ConnectResponse)
async def connect_data_source(
    body: ConnectRequest,
    request: Request,
    service: ConnectorService = Depends(get_connector_service),
):
    user_id = request.state.user_id
    config = ConnectorConfig(
        name=body.name,
        connector_type=body.connector_type,
        credentials=body.credentials,
        settings=body.settings,
    )
    try:
        results = await service.connect_and_ingest(
            user_id, config, selected_sheets=body.selected_sheets
        )
        return ConnectResponse(datasets=results, status="success")
    except ConnectorError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except (RowLimitExceededError, ColumnLimitExceededError) as e:
        raise HTTPException(status_code=422, detail=e.message)


@router.post("/discover", response_model=DiscoverResponse)
async def discover_datasets(
    body: ConnectRequest,
    request: Request,
):
    config = ConnectorConfig(
        name=body.name,
        connector_type=body.connector_type,
        credentials=body.credentials,
        settings=body.settings,
    )
    try:
        connector = ConnectorRegistry.get_connector(config)

        if not await connector.test_connection():
            from app.connectors.adapters.google_sheets import get_service_account_email

            sa_email = get_service_account_email()
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Cannot access this spreadsheet. "
                    f"Please share it with: {sa_email} "
                    f"(set permission to 'Viewer'), then try again."
                ),
            )

        datasets = await connector.discover_datasets()
        return DiscoverResponse(
            datasets=[
                {
                    "id": d.id,
                    "name": d.name,
                    "description": d.description,
                    "row_count": d.row_count,
                    "columns": d.columns,
                }
                for d in datasets
            ]
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Discover failed: %s", e)
        raise HTTPException(status_code=400, detail="Failed to access spreadsheet. Please check the URL and try again.")
