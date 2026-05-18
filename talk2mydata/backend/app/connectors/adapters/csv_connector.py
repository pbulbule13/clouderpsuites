import logging

import pandas as pd

from app.common.exceptions import FileParseError
from app.connectors.adapters._file_utils import (
    FileConnector,
    detect_encoding,
    sniff_delimiter,
)
from app.connectors.registry import ConnectorRegistry

logger = logging.getLogger(__name__)


@ConnectorRegistry.register("csv")
class CsvConnector(FileConnector):
    """Ingests a CSV/TSV file. Values are read as strings so the shared
    schema inference can detect currency/percent/date formatting."""

    def _load_frames(self) -> dict[str, pd.DataFrame]:
        encoding = detect_encoding(self.path)
        delimiter = sniff_delimiter(self.path, encoding)
        try:
            df = pd.read_csv(
                self.path,
                dtype=str,
                sep=delimiter,
                encoding=encoding,
                keep_default_na=False,
                skip_blank_lines=True,
            )
        except (pd.errors.ParserError, pd.errors.EmptyDataError) as e:
            raise FileParseError(str(e))
        except UnicodeDecodeError as e:
            raise FileParseError(f"Could not decode the file as text ({e}).")

        if df.empty or len(df.columns) == 0:
            raise FileParseError("The CSV file has no data rows.")

        return {self.path.stem or "csv_data": df}
