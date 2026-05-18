import logging

import pandas as pd

from app.common.exceptions import FileFormatError, FileParseError
from app.connectors.adapters._file_utils import FileConnector
from app.connectors.registry import ConnectorRegistry

logger = logging.getLogger(__name__)


@ConnectorRegistry.register("json")
class JsonConnector(FileConnector):
    """Ingests a JSON or NDJSON file of flat, tabular records."""

    def _load_frames(self) -> dict[str, pd.DataFrame]:
        text = self.path.read_text(encoding="utf-8", errors="replace").lstrip()
        is_ndjson = self.path.suffix.lower() == ".ndjson" or (
            text and not text.startswith("[")
        )
        try:
            df = pd.read_json(self.path, lines=is_ndjson)
        except ValueError as e:
            raise FileParseError(str(e))

        if df.empty or len(df.columns) == 0:
            raise FileParseError("The JSON file has no records.")

        for col in df.columns:
            if df[col].apply(lambda v: isinstance(v, (dict, list))).any():
                raise FileFormatError(
                    "JSON must be flat tabular data - nested objects or arrays "
                    "are not supported."
                )

        return {self.path.stem or "json_data": df}
