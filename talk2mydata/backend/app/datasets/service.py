import hashlib

import pandas as pd
from google.cloud import bigquery
from google.cloud.firestore import AsyncClient

from app.common.async_utils import run_sync
from app.config import settings
from app.datasets.schema_inference import sanitize_column_name


class DatasetService:
    def __init__(self, bq_client: bigquery.Client, db: AsyncClient):
        self.bq = bq_client
        self.db = db

    @staticmethod
    def user_dataset_name(user_id: str) -> str:
        """Deterministic, collision-resistant dataset name from user ID."""
        return f"{settings.BQ_DATASET_PREFIX}{hashlib.sha256(user_id.encode()).hexdigest()[:20]}"

    def _user_dataset_id(self, user_id: str) -> str:
        return f"{settings.GCP_PROJECT}.{self.user_dataset_name(user_id)}"

    async def ensure_user_dataset(self, user_id: str):
        dataset_id = self._user_dataset_id(user_id)
        dataset = bigquery.Dataset(dataset_id)
        dataset.location = "US"
        await run_sync(self.bq.create_dataset, dataset, exists_ok=True)

    async def load_dataframe(
        self,
        user_id: str,
        table_name: str,
        df: pd.DataFrame,
        schema: list[bigquery.SchemaField],
    ):
        dataset_id = self._user_dataset_id(user_id)
        table_ref = f"{dataset_id}.{sanitize_column_name(table_name)}"

        col_mapping = {old: field.name for old, field in zip(df.columns, schema)}
        df = df.rename(columns=col_mapping)

        job_config = bigquery.LoadJobConfig(
            schema=schema,
            write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
            create_disposition=bigquery.CreateDisposition.CREATE_IF_NEEDED,
        )
        job = await run_sync(
            self.bq.load_table_from_dataframe, df, table_ref, job_config=job_config
        )
        await run_sync(job.result)
        return await run_sync(self.bq.get_table, table_ref)

    async def register_dataset(self, user_id: str, dataset_meta: dict):
        doc_ref = (
            self.db.collection("users")
            .document(user_id)
            .collection("datasets")
            .document(dataset_meta["id"])
        )
        await doc_ref.set(dataset_meta)

    async def get_user_datasets(self, user_id: str) -> list[dict]:
        docs = (
            self.db.collection("users")
            .document(user_id)
            .collection("datasets")
            .stream()
        )
        return [doc.to_dict() async for doc in docs]

    async def get_dataset_schema(self, user_id: str, dataset_id: str) -> dict | None:
        doc = await (
            self.db.collection("users")
            .document(user_id)
            .collection("datasets")
            .document(dataset_id)
            .get()
        )
        return doc.to_dict() if doc.exists else None

    async def delete_dataset(self, user_id: str, dataset_id: str):
        dataset_meta = await self.get_dataset_schema(user_id, dataset_id)
        if not dataset_meta:
            return

        # Delete BigQuery table
        bq_dataset = self._user_dataset_id(user_id)
        table_ref = f"{bq_dataset}.{dataset_meta['table_name']}"
        await run_sync(self.bq.delete_table, table_ref, not_found_ok=True)

        # Delete Firestore metadata
        await (
            self.db.collection("users")
            .document(user_id)
            .collection("datasets")
            .document(dataset_id)
            .delete()
        )

    async def refresh_dataset(self, user_id: str, dataset_id: str) -> dict | None:
        dataset_meta = await self.get_dataset_schema(user_id, dataset_id)
        if not dataset_meta:
            return None
        # Re-import would be handled by ConnectorService
        return dataset_meta
