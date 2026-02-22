import uuid

import pandas as pd
from google.cloud import firestore

from app.common.async_utils import run_sync
from app.common.exceptions import (
    ColumnLimitExceededError,
    ConnectorError,
    RowLimitExceededError,
)
from app.config import settings
from app.connectors.ports import ConnectorConfig
from app.connectors.registry import ConnectorRegistry
from app.datasets.schema_inference import infer_bigquery_schema, sanitize_column_name
from app.datasets.service import DatasetService


class ConnectorService:
    def __init__(self, dataset_service: DatasetService):
        self.dataset_service = dataset_service

    async def connect_and_ingest(
        self,
        user_id: str,
        config: ConnectorConfig,
        selected_sheets: list[str] | None = None,
    ) -> list[dict]:
        connector = ConnectorRegistry.get_connector(config)

        if not await connector.test_connection():
            raise ConnectorError(
                config.connector_type,
                "Cannot connect. Check the URL and ensure access is granted.",
            )

        available = await connector.discover_datasets()

        if selected_sheets:
            available = [d for d in available if d.id in selected_sheets]

        await self.dataset_service.ensure_user_dataset(user_id)

        results = []
        for dataset_info in available:
            if (
                dataset_info.row_count
                and dataset_info.row_count > settings.MAX_ROWS_PER_IMPORT
            ):
                raise RowLimitExceededError(
                    dataset_info.name, settings.MAX_ROWS_PER_IMPORT
                )

            all_chunks = []
            async for chunk in connector.extract_data(dataset_info.id):
                all_chunks.append(chunk)

            if not all_chunks:
                continue

            full_df = await run_sync(pd.concat, all_chunks, ignore_index=True)

            if len(full_df.columns) > settings.MAX_COLUMNS_PER_IMPORT:
                raise ColumnLimitExceededError(
                    dataset_info.name, settings.MAX_COLUMNS_PER_IMPORT
                )

            schema = await run_sync(infer_bigquery_schema, full_df)
            table_name = sanitize_column_name(dataset_info.name)

            table = await self.dataset_service.load_dataframe(
                user_id, table_name, full_df, schema
            )

            dataset_id = str(uuid.uuid4())
            meta = {
                "id": dataset_id,
                "name": dataset_info.name,
                "table_name": table_name,
                "source_type": config.connector_type,
                "source_url": config.settings.get("url", ""),
                "row_count": table.num_rows,
                "columns": [
                    {
                        "name": f.name,
                        "type": f.field_type,
                        "original_name": f.description or f.name,
                    }
                    for f in schema
                ],
                "status": "ready",
                "created_at": firestore.SERVER_TIMESTAMP,
            }
            await self.dataset_service.register_dataset(user_id, meta)
            results.append(meta)

        return results
