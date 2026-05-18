class Talk2MyDataError(Exception):
    """Base exception for Talk2MyData."""

    def __init__(self, message: str, code: str = "unknown_error"):
        self.message = message
        self.code = code
        super().__init__(message)


class DatasetNotFoundError(Talk2MyDataError):
    def __init__(self, dataset_id: str):
        super().__init__(
            message=f"Dataset '{dataset_id}' not found",
            code="dataset_not_found",
        )


class DatasetLimitExceededError(Talk2MyDataError):
    def __init__(self, limit: int):
        super().__init__(
            message=f"Maximum of {limit} datasets per user exceeded",
            code="dataset_limit_exceeded",
        )


class RowLimitExceededError(Talk2MyDataError):
    def __init__(self, sheet_name: str, limit: int):
        super().__init__(
            message=f"Sheet '{sheet_name}' exceeds the {limit:,} row limit",
            code="row_limit_exceeded",
        )


class ColumnLimitExceededError(Talk2MyDataError):
    def __init__(self, sheet_name: str, limit: int):
        super().__init__(
            message=f"Sheet '{sheet_name}' exceeds the {limit} column limit",
            code="column_limit_exceeded",
        )


class ConnectorError(Talk2MyDataError):
    def __init__(self, connector_type: str, detail: str):
        super().__init__(
            message=f"Connector error ({connector_type}): {detail}",
            code="connector_error",
        )


class SpreadsheetNotFoundError(Talk2MyDataError):
    def __init__(self, detail: str = "Spreadsheet not found. Check the URL and try again."):
        super().__init__(message=detail, code="spreadsheet_not_found")


class SpreadsheetAccessError(Talk2MyDataError):
    def __init__(self, sa_email: str):
        super().__init__(
            message=(
                f"Cannot access this spreadsheet. Please share it with: {sa_email} "
                f"(set permission to 'Viewer'), then try again."
            ),
            code="spreadsheet_access_denied",
        )


class SpreadsheetQuotaError(Talk2MyDataError):
    def __init__(self):
        super().__init__(
            message="Google Sheets API rate limit reached. Please retry in a minute.",
            code="spreadsheet_quota_exceeded",
        )


class UnsupportedFileTypeError(Talk2MyDataError):
    def __init__(self, filename: str):
        super().__init__(
            message=(
                f"Unsupported file type: '{filename}'. "
                f"Supported formats: CSV, Excel (.xlsx), JSON/NDJSON, Parquet."
            ),
            code="unsupported_file_type",
        )


class FileParseError(Talk2MyDataError):
    def __init__(self, detail: str):
        super().__init__(
            message=f"Could not parse the uploaded file: {detail}",
            code="file_parse_error",
        )


class FileFormatError(Talk2MyDataError):
    def __init__(self, detail: str):
        super().__init__(message=detail, code="file_format_error")


class QueryLimitExceededError(Talk2MyDataError):
    def __init__(self):
        super().__init__(
            message="Daily query limit exceeded. Please try again tomorrow.",
            code="query_limit_exceeded",
        )


class SQLValidationError(Talk2MyDataError):
    def __init__(self, errors: list[str]):
        self.errors = errors
        super().__init__(
            message=f"SQL validation failed: {'; '.join(errors)}",
            code="sql_validation_error",
        )
