import re
from typing import AsyncIterator

import gspread
import pandas as pd
from google.oauth2.credentials import Credentials

from app.common.async_utils import run_sync
from app.config import settings
from app.connectors.ports import ConnectorConfig, DataConnector, DatasetInfo
from app.connectors.registry import ConnectorRegistry


@ConnectorRegistry.register("google_sheets")
class GoogleSheetsConnector(DataConnector):
    def __init__(self, config: ConnectorConfig):
        self.config = config
        self.spreadsheet_id = self._extract_spreadsheet_id(config.settings["url"])
        self._client: gspread.Client | None = None

    @staticmethod
    def _extract_spreadsheet_id(url: str) -> str:
        match = re.search(r"/spreadsheets/d/([a-zA-Z0-9-_]+)", url)
        if not match:
            raise ValueError(f"Invalid Google Sheets URL: {url}")
        return match.group(1)

    async def _get_client(self) -> gspread.Client:
        if self._client is None:
            if not settings.GOOGLE_SHEETS_CLIENT_ID or not settings.GOOGLE_SHEETS_CLIENT_SECRET:
                raise ValueError(
                    "Google Sheets OAuth credentials not configured on the server"
                )

            def _init_client():
                creds = Credentials(
                    token=self.config.credentials["access_token"],
                    refresh_token=self.config.credentials.get("refresh_token"),
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=settings.GOOGLE_SHEETS_CLIENT_ID,
                    client_secret=settings.GOOGLE_SHEETS_CLIENT_SECRET,
                    scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
                )
                return gspread.authorize(creds)
            self._client = await run_sync(_init_client)
        return self._client

    async def test_connection(self) -> bool:
        try:
            client = await self._get_client()
            await run_sync(client.open_by_key, self.spreadsheet_id)
            return True
        except gspread.exceptions.APIError:
            return False

    async def discover_datasets(self) -> list[DatasetInfo]:
        client = await self._get_client()
        spreadsheet = await run_sync(client.open_by_key, self.spreadsheet_id)
        worksheets = await run_sync(spreadsheet.worksheets)
        datasets = []
        for worksheet in worksheets:
            datasets.append(
                DatasetInfo(
                    id=worksheet.title,
                    name=worksheet.title,
                    description=f"Sheet '{worksheet.title}' in '{spreadsheet.title}'",
                    row_count=max(0, worksheet.row_count - 1),
                    columns=[],
                )
            )
        return datasets

    async def extract_data(self, dataset_id: str) -> AsyncIterator[pd.DataFrame]:
        client = await self._get_client()
        spreadsheet = await run_sync(client.open_by_key, self.spreadsheet_id)
        worksheet = await run_sync(spreadsheet.worksheet, dataset_id)
        all_values = await run_sync(worksheet.get_all_values)
        if len(all_values) < 2:
            return
        headers = all_values[0]
        chunk_size = 10_000
        for i in range(1, len(all_values), chunk_size):
            chunk = all_values[i : i + chunk_size]
            yield pd.DataFrame(chunk, columns=headers)

    async def get_schema(self, dataset_id: str) -> list[dict]:
        client = await self._get_client()
        spreadsheet = await run_sync(client.open_by_key, self.spreadsheet_id)
        worksheet = await run_sync(spreadsheet.worksheet, dataset_id)
        headers = await run_sync(worksheet.row_values, 1)
        return [{"name": h, "type": "STRING", "description": ""} for h in headers]
