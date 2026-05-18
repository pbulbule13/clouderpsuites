import functools
import json
import logging
import re
from pathlib import Path
from typing import AsyncIterator

import google.auth
import gspread
import pandas as pd
from google.oauth2.credentials import Credentials
from google.oauth2.service_account import Credentials as ServiceAccountCredentials

from app.common.async_utils import run_sync
from app.common.exceptions import (
    ConnectorError,
    SpreadsheetAccessError,
    SpreadsheetNotFoundError,
    SpreadsheetQuotaError,
)
from app.config import settings
from app.connectors.ports import ConnectorConfig, DataConnector, DatasetInfo
from app.connectors.registry import ConnectorRegistry

logger = logging.getLogger(__name__)


@functools.lru_cache(maxsize=1)
def _load_service_account_email() -> str:
    """Load the service account email from the key file or ADC (cached via lru_cache)."""
    # Try key file first
    key_path = Path(settings.SERVICE_ACCOUNT_KEY_PATH)
    if key_path.exists():
        try:
            data = json.loads(key_path.read_text())
            return data.get("client_email", "")
        except Exception:
            pass

    # Fall back to ADC (Cloud Run service account)
    try:
        creds, _ = google.auth.default()
        return getattr(creds, "service_account_email", "") or ""
    except Exception:
        pass

    return ""


def get_service_account_email() -> str:
    """Public helper to get the SA email for error messages."""
    return _load_service_account_email() or "the service account"


@ConnectorRegistry.register("google_sheets")
class GoogleSheetsConnector(DataConnector):
    SCOPES = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
    ]

    def __init__(self, config: ConnectorConfig):
        self.config = config
        self.spreadsheet_id = self._extract_spreadsheet_id(config.settings.get("url", ""))
        self._client: gspread.Client | None = None
        self._spreadsheet: gspread.Spreadsheet | None = None
        self._use_service_account = not config.credentials.get("access_token")

    @staticmethod
    def _extract_spreadsheet_id(url: str) -> str:
        from urllib.parse import urlparse

        parsed = urlparse(url)
        if parsed.hostname != "docs.google.com":
            raise ConnectorError(
                "google_sheets",
                "Only Google Sheets URLs (docs.google.com) are accepted.",
            )
        match = re.search(r"/spreadsheets/d/([a-zA-Z0-9-_]+)", url)
        if not match:
            raise ConnectorError("google_sheets", "Invalid Google Sheets URL format.")
        return match.group(1)

    async def _get_client(self) -> gspread.Client:
        if self._client is not None:
            return self._client

        if self._use_service_account:
            self._client = await self._init_service_account_client()
        else:
            self._client = await self._init_oauth_client()

        return self._client

    async def _init_service_account_client(self) -> gspread.Client:
        """Initialize gspread using key file or Application Default Credentials."""
        key_path = Path(settings.SERVICE_ACCOUNT_KEY_PATH)

        def _init():
            if key_path.exists():
                # Local dev: use explicit key file
                creds = ServiceAccountCredentials.from_service_account_file(
                    str(key_path), scopes=self.SCOPES
                )
            else:
                # Cloud Run: use Application Default Credentials
                creds, _ = google.auth.default(scopes=self.SCOPES)
            return gspread.authorize(creds)

        return await run_sync(_init)

    async def _init_oauth_client(self) -> gspread.Client:
        """Initialize gspread using user-provided OAuth credentials."""
        if not settings.GOOGLE_SHEETS_CLIENT_ID or not settings.GOOGLE_SHEETS_CLIENT_SECRET:
            raise ValueError(
                "Google Sheets OAuth credentials not configured on the server"
            )

        def _init():
            creds = Credentials(
                token=self.config.credentials["access_token"],
                refresh_token=self.config.credentials.get("refresh_token"),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_SHEETS_CLIENT_ID,
                client_secret=settings.GOOGLE_SHEETS_CLIENT_SECRET,
                scopes=self.SCOPES,
            )
            return gspread.authorize(creds)

        return await run_sync(_init)

    async def _get_spreadsheet(self) -> gspread.Spreadsheet:
        if self._spreadsheet is not None:
            return self._spreadsheet
        client = await self._get_client()
        try:
            self._spreadsheet = await run_sync(client.open_by_key, self.spreadsheet_id)
        except gspread.exceptions.SpreadsheetNotFound:
            raise SpreadsheetNotFoundError()
        except gspread.exceptions.APIError as e:
            # Log the raw gspread text server-side only - it leaks the GCP project
            # number and internal API URLs, so it must never reach the client.
            logger.warning("Sheets API error for %s: %s", self.spreadsheet_id, e)
            status = getattr(getattr(e, "response", None), "status_code", None)
            if status == 403:
                raise SpreadsheetAccessError(get_service_account_email())
            if status == 404:
                raise SpreadsheetNotFoundError()
            if status == 429:
                raise SpreadsheetQuotaError()
            raise ConnectorError(
                "google_sheets", "Google Sheets API error. Please try again."
            )
        return self._spreadsheet

    async def test_connection(self) -> bool:
        try:
            await self._get_spreadsheet()
            return True
        except Exception as e:
            logger.warning("Connection test failed for %s: %s", self.spreadsheet_id, e)
            return False

    async def discover_datasets(self) -> list[DatasetInfo]:
        spreadsheet = await self._get_spreadsheet()
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
        spreadsheet = await self._get_spreadsheet()
        worksheet = await run_sync(spreadsheet.worksheet, dataset_id)
        all_values = await run_sync(worksheet.get_all_values)

        if len(all_values) < 2:
            return

        headers = all_values[0]
        num_cols = len(headers)

        # Clean up: remove fully empty trailing columns
        while num_cols > 0 and all(h.strip() == "" for h in [headers[num_cols - 1]]):
            # Check if the entire column is empty
            col_empty = all(
                (len(row) <= num_cols - 1 or row[num_cols - 1].strip() == "")
                for row in all_values[1:]
            )
            if col_empty:
                num_cols -= 1
            else:
                break
        headers = headers[:num_cols]

        # Give unnamed headers a default name
        headers = [
            h.strip() if h.strip() else f"column_{i + 1}"
            for i, h in enumerate(headers)
        ]

        # Process data rows
        data_rows = []
        for row in all_values[1:]:
            # Skip fully empty rows
            if all(cell.strip() == "" for cell in row):
                continue
            # Normalize row length to match headers
            if len(row) < num_cols:
                row = row + [""] * (num_cols - len(row))
            elif len(row) > num_cols:
                row = row[:num_cols]
            data_rows.append(row)

        if not data_rows:
            return

        chunk_size = 10_000
        for i in range(0, len(data_rows), chunk_size):
            chunk = data_rows[i : i + chunk_size]
            yield pd.DataFrame(chunk, columns=headers)

    async def get_schema(self, dataset_id: str) -> list[dict]:
        spreadsheet = await self._get_spreadsheet()
        worksheet = await run_sync(spreadsheet.worksheet, dataset_id)
        headers = await run_sync(worksheet.row_values, 1)
        return [{"name": h, "type": "STRING", "description": ""} for h in headers if h.strip()]
