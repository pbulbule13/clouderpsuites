import logging

from fastapi import APIRouter, Depends, Request

from app.connectors.ports import ConnectorConfig
from app.connectors.registry import ConnectorRegistry
from app.connectors.schemas import ConnectRequest, ConnectResponse, DiscoverResponse
from app.connectors.service import ConnectorService
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
    results = await service.connect_and_ingest(
        user_id, config, selected_sheets=body.selected_sheets
    )
    return ConnectResponse(datasets=results, status="success")


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
    connector = ConnectorRegistry.get_connector(config)
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
