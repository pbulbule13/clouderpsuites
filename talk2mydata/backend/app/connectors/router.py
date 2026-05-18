import json
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile

from app.common.exceptions import FileFormatError, UnsupportedFileTypeError
from app.connectors.adapters._file_utils import detect_connector_type, stream_to_tmp
from app.connectors.ports import ConnectorConfig
from app.connectors.registry import ConnectorRegistry
from app.connectors.schemas import ConnectRequest, ConnectResponse, DiscoverResponse
from app.connectors.service import ConnectorService
from app.dependencies import get_connector_service

logger = logging.getLogger(__name__)

router = APIRouter()

FILE_CONNECTOR_TYPES = {"csv", "excel", "json", "parquet"}


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


@router.post("/upload", response_model=ConnectResponse)
async def upload_file(
    request: Request,
    name: str = Form(..., max_length=200),
    file: UploadFile = File(...),
    connector_type: str | None = Form(None),
    options: str | None = Form(None),
    service: ConnectorService = Depends(get_connector_service),
):
    """Ingest an uploaded data file (CSV, Excel, JSON/NDJSON, Parquet).

    The file is streamed to a temp path, parsed by the matching connector,
    and the temp file is removed once ingestion completes.
    """
    user_id = request.state.user_id
    filename = file.filename or "upload"
    detected = connector_type or detect_connector_type(filename)
    if detected not in FILE_CONNECTOR_TYPES:
        raise UnsupportedFileTypeError(filename)

    try:
        parsed_options = json.loads(options) if options else {}
    except json.JSONDecodeError:
        raise FileFormatError("Malformed 'options' field - expected JSON.")

    tmp_path = await stream_to_tmp(file, suffix=Path(filename).suffix)
    try:
        config = ConnectorConfig(
            name=name,
            connector_type=detected,
            credentials={},
            settings={"file_path": str(tmp_path), "options": parsed_options},
        )
        results = await service.connect_and_ingest(
            user_id, config, selected_sheets=None
        )
        return ConnectResponse(datasets=results, status="success")
    finally:
        tmp_path.unlink(missing_ok=True)
