import logging

import pandas as pd

from app.common.exceptions import FileParseError
from app.connectors.adapters._file_utils import FileConnector
from app.connectors.registry import ConnectorRegistry

logger = logging.getLogger(__name__)


@ConnectorRegistry.register("parquet")
class ParquetConnector(FileConnector):
    """Ingests a Parquet file. Native column types are preserved."""

    def _load_frames(self) -> dict[str, pd.DataFrame]:
        try:
            df = pd.read_parquet(self.path, engine="pyarrow")
        except Exception as e:
            logger.warning("Parquet parse failed for %s: %s", self.path.name, e)
            raise FileParseError("The Parquet file could not be read.")

        if df.empty or len(df.columns) == 0:
            raise FileParseError("The Parquet file has no data.")

        return {self.path.stem or "parquet_data": df}
