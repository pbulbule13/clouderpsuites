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
