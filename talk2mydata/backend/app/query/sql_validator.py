import sqlglot
from google.cloud import bigquery

from app.common.exceptions import SQLValidationError
from app.config import settings

BLOCKED_KEYWORDS = {
    "DROP", "DELETE", "UPDATE", "INSERT", "ALTER",
    "TRUNCATE", "CREATE", "MERGE", "GRANT", "REVOKE",
}


class SQLValidator:
    def __init__(self, bq_client: bigquery.Client):
        self.bq = bq_client

    def validate(self, sql: str, allowed_dataset: str) -> dict:
        errors = []

        if not sql or not sql.strip():
            raise SQLValidationError(["Empty SQL query"])

        # Stage 1: Block dangerous keywords
        sql_upper = sql.upper()
        for kw in BLOCKED_KEYWORDS:
            if f" {kw} " in f" {sql_upper} " or sql_upper.startswith(f"{kw} "):
                errors.append(f"Disallowed operation: {kw}")

        if errors:
            raise SQLValidationError(errors)

        # Stage 2: Parse with sqlglot
        try:
            parsed = sqlglot.parse_one(sql, read="bigquery")
        except sqlglot.errors.ParseError as e:
            raise SQLValidationError([f"SQL syntax error: {e}"])

        # Ensure it's a SELECT statement
        if not isinstance(parsed, sqlglot.exp.Select):
            raise SQLValidationError(["Only SELECT queries are allowed"])

        # Stage 3: Check dataset access
        for table in parsed.find_all(sqlglot.exp.Table):
            table_str = str(table)
            if allowed_dataset and allowed_dataset not in table_str:
                errors.append(f"Unauthorized table access: {table_str}")

        if errors:
            raise SQLValidationError(errors)

        # Stage 4: BigQuery dry-run (cost + semantic validation)
        job_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
        try:
            dry_run = self.bq.query(sql, job_config=job_config)
            bytes_processed = dry_run.total_bytes_processed or 0
            if bytes_processed > settings.MAX_QUERY_BYTES_SCANNED:
                raise SQLValidationError(
                    [
                        f"Query would scan {bytes_processed / 1e9:.2f} GB, "
                        f"exceeding the {settings.MAX_QUERY_BYTES_SCANNED / 1e9:.0f} GB limit"
                    ]
                )
        except SQLValidationError:
            raise
        except Exception as e:
            raise SQLValidationError([f"BigQuery validation error: {e}"])

        return {"valid": True, "bytes_processed": bytes_processed}
