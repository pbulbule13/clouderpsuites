import re

import pandas as pd
from google.cloud import bigquery

DATE_PATTERNS = [
    (r"^\d{4}-\d{2}-\d{2}$", bigquery.enums.SqlTypeNames.DATE),
    (r"^\d{2}/\d{2}/\d{4}$", bigquery.enums.SqlTypeNames.DATE),
    (r"^\d{1,2}/\d{1,2}/\d{2,4}$", bigquery.enums.SqlTypeNames.DATE),
    (r"^\d{4}-\d{2}-\d{2}T", bigquery.enums.SqlTypeNames.TIMESTAMP),
]

# Patterns for values that look numeric but have formatting
CURRENCY_RE = re.compile(r"^[\$\u20ac\u00a3\u00a5]?\s*-?[\d,]+\.?\d*$")
PERCENT_RE = re.compile(r"^-?[\d,]+\.?\d*\s*%$")
COMMA_NUMBER_RE = re.compile(r"^-?[\d,]+\.?\d*$")


def sanitize_column_name(name: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9_]", "_", name).strip("_")
    clean = re.sub(r"_+", "_", clean)
    if clean and clean[0].isdigit():
        clean = f"col_{clean}"
    return clean.lower() or "unnamed_column"


def _strip_formatting(value: str) -> str | None:
    """Strip currency symbols, commas, percent signs from a value for numeric parsing."""
    s = value.strip()
    if not s:
        return None
    # Remove currency symbols
    s = re.sub(r"^[\$\u20ac\u00a3\u00a5]\s*", "", s)
    # Remove percent sign
    s = s.rstrip("%").strip()
    # Remove thousands separators
    s = s.replace(",", "")
    return s


def _detect_type_from_sample(series: pd.Series) -> str:
    """Detect BigQuery type from a sample of string values."""
    non_empty = series.dropna()
    non_empty = non_empty[non_empty.astype(str).str.strip() != ""]

    if len(non_empty) == 0:
        return "STRING"

    # Sample up to 20 values for type detection (more robust than just first)
    sample_size = min(20, len(non_empty))
    sample = non_empty.head(sample_size).astype(str)

    # Check for date/timestamp patterns
    first_val = str(sample.iloc[0]).strip()
    for pattern, detected_type in DATE_PATTERNS:
        if re.match(pattern, first_val):
            # Verify at least 80% of sample matches
            matches = sum(1 for v in sample if re.match(pattern, str(v).strip()))
            if matches / sample_size >= 0.8:
                return detected_type
            break

    # Check for boolean
    unique_lower = set(non_empty.astype(str).str.lower().str.strip().unique())
    if unique_lower <= {"true", "false", "yes", "no", "1", "0"}:
        return "BOOL"

    # Check for numeric (including formatted numbers like $1,234.56 or 45.5%)
    numeric_count = 0
    is_integer = True
    for val in sample:
        stripped = _strip_formatting(str(val))
        if stripped is None:
            continue
        try:
            num = float(stripped)
            numeric_count += 1
            if num != int(num):
                is_integer = False
        except (ValueError, OverflowError):
            pass

    if numeric_count / sample_size >= 0.8:
        return "INT64" if is_integer else "FLOAT64"

    return "STRING"


def infer_bigquery_schema(df: pd.DataFrame) -> list[bigquery.SchemaField]:
    schema = []
    seen_names: set[str] = set()

    for col in df.columns:
        clean_name = sanitize_column_name(col)
        base_name = clean_name
        counter = 1
        while clean_name in seen_names:
            clean_name = f"{base_name}_{counter}"
            counter += 1
        seen_names.add(clean_name)

        series = df[col].dropna()
        if len(series) == 0:
            schema.append(
                bigquery.SchemaField(clean_name, "STRING", mode="NULLABLE")
            )
            continue

        if series.dtype == "object":
            bq_type = _detect_type_from_sample(series)
        else:
            dtype_str = str(series.dtype)
            if dtype_str.startswith("datetime64"):
                bq_type = "TIMESTAMP"
            else:
                type_map = {"int64": "INT64", "float64": "FLOAT64", "bool": "BOOL"}
                bq_type = type_map.get(dtype_str, "STRING")

        schema.append(
            bigquery.SchemaField(
                clean_name, bq_type, mode="NULLABLE", description=col
            )
        )
    return schema
