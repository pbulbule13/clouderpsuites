import logging

import pandas as pd

from app.common.exceptions import FileFormatError, FileParseError
from app.connectors.adapters._file_utils import FileConnector
from app.connectors.registry import ConnectorRegistry

logger = logging.getLogger(__name__)


@ConnectorRegistry.register("excel")
class ExcelConnector(FileConnector):
    """Ingests an Excel workbook. Each non-empty worksheet becomes a dataset."""

    def _load_frames(self) -> dict[str, pd.DataFrame]:
        try:
            sheets = pd.read_excel(self.path, sheet_name=None, engine="openpyxl")
        except FileFormatError:
            raise
        except ValueError as e:
            raise FileParseError(str(e))
        except Exception as e:
            logger.warning("Excel parse failed for %s: %s", self.path.name, e)
            raise FileParseError("The Excel file could not be read. Confirm it is a valid .xlsx file.")

        frames = {
            str(sheet_name): df
            for sheet_name, df in sheets.items()
            if not df.empty
        }
        if not frames:
            raise FileFormatError("The Excel file has no non-empty worksheets.")
        return frames
