"""Shared helpers for file-upload connectors (CSV, Excel, JSON, Parquet)."""

import csv as _csv
import logging
import tempfile
from pathlib import Path
from typing import AsyncIterator

import pandas as pd
from fastapi import UploadFile

from app.common.async_utils import run_sync
from app.common.exceptions import FileFormatError
from app.connectors.ports import ConnectorConfig, DataConnector, DatasetInfo

logger = logging.getLogger(__name__)

# File extension -> connector type. Mirrored on the frontend in lib/file-types.ts.
EXTENSION_MAP: dict[str, str] = {
    ".csv": "csv",
    ".tsv": "csv",
    ".xlsx": "excel",
    ".xls": "excel",
    ".json": "json",
    ".ndjson": "json",
    ".parquet": "parquet",
}

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
_CHUNK_BYTES = 1024 * 1024
_EXTRACT_CHUNK_ROWS = 10_000


def detect_connector_type(filename: str) -> str | None:
    """Map a filename's extension to a connector type, or None if unsupported."""
    return EXTENSION_MAP.get(Path(filename).suffix.lower())


async def stream_to_tmp(upload: UploadFile, suffix: str) -> Path:
    """Stream an UploadFile to a temp file on disk, enforcing the 10 MB cap.

    Cloud Run's /tmp is an in-memory, per-instance filesystem - fine for the
    ingest-then-discard lifecycle. The caller is responsible for unlinking.
    """
    fd, tmp_name = tempfile.mkstemp(suffix=suffix)
    tmp_path = Path(tmp_name)
    total = 0
    try:
        with open(fd, "wb") as out:
            while chunk := await upload.read(_CHUNK_BYTES):
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise FileFormatError("File exceeds the 10 MB upload limit.")
                out.write(chunk)
    except Exception:
        tmp_path.unlink(missing_ok=True)
        raise
    return tmp_path


def detect_encoding(path: Path) -> str:
    """Best-effort text encoding detection for CSV/JSON files."""
    import chardet

    raw = path.read_bytes()[:65536]
    if not raw:
        return "utf-8"
    result = chardet.detect(raw)
    return result.get("encoding") or "utf-8"


def sniff_delimiter(path: Path, encoding: str) -> str:
    """Sniff the CSV delimiter; fall back to comma."""
    with open(path, "r", encoding=encoding, errors="replace") as f:
        sample = f.read(8192)
    try:
        return _csv.Sniffer().sniff(sample, delimiters=",;\t|").delimiter
    except _csv.Error:
        return ","


class FileConnector(DataConnector):
    """Base class for file-upload connectors.

    Subclasses implement `_load_frames()` which parses the file into one or
    more named pandas DataFrames (e.g. one per worksheet for Excel). The base
    handles dataset discovery, chunked extraction, and schema reporting.
    """

    def __init__(self, config: ConnectorConfig):
        self.config = config
        self.path = Path(config.settings.get("file_path", ""))
        self.options: dict = config.settings.get("options", {})
        self._frames: dict[str, pd.DataFrame] | None = None

    def _load_frames(self) -> dict[str, pd.DataFrame]:
        """Parse the file into {display_name: DataFrame}. Override in subclass."""
        raise NotImplementedError

    async def _frames_cached(self) -> dict[str, pd.DataFrame]:
        if self._frames is None:
            self._frames = await run_sync(self._load_frames)
        return self._frames

    async def test_connection(self) -> bool:
        return self.path.is_file() and self.path.stat().st_size > 0

    async def discover_datasets(self) -> list[DatasetInfo]:
        frames = await self._frames_cached()
        return [
            DatasetInfo(
                id=name,
                name=name,
                description=f"{len(df):,} rows, {len(df.columns)} columns",
                row_count=len(df),
                columns=[{"name": str(c)} for c in df.columns],
            )
            for name, df in frames.items()
        ]

    async def extract_data(self, dataset_id: str) -> AsyncIterator[pd.DataFrame]:
        frames = await self._frames_cached()
        df = frames.get(dataset_id)
        if df is None or df.empty:
            return
        for i in range(0, len(df), _EXTRACT_CHUNK_ROWS):
            yield df.iloc[i : i + _EXTRACT_CHUNK_ROWS]

    async def get_schema(self, dataset_id: str) -> list[dict]:
        frames = await self._frames_cached()
        df = frames.get(dataset_id, pd.DataFrame())
        return [{"name": str(c), "type": "STRING", "description": ""} for c in df.columns]
