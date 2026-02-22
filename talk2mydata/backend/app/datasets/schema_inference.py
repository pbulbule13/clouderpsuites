import re

import pandas as pd
from google.cloud import bigquery

DATE_PATTERNS = [
    (r"^\d{4}-\d{2}-\d{2}$", bigquery.enums.SqlTypeNames.DATE),
    (r"^\d{2}/\d{2}/\d{4}$", bigquery.enums.SqlTypeNames.DATE),
    (r"^\d{4}-\d{2}-\d{2}T", bigquery.enums.SqlTypeNames.TIMESTAMP),
]


def sanitize_column_name(name: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9_]", "_", name).strip("_")
    clean = re.sub(r"_+", "_", clean)
    if clean and clean[0].isdigit():
        clean = f"col_{clean}"
    return clean.lower() or "unnamed_column"


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

        bq_type = None
        if series.dtype == "object":
            sample = str(series.iloc[0])
            for pattern, detected_type in DATE_PATTERNS:
                if re.match(pattern, sample):
                    bq_type = detected_type
                    break

            if bq_type is None:
                try:
                    numeric = pd.to_numeric(series, errors="raise")
                    bq_type = "INT64" if (numeric % 1 == 0).all() else "FLOAT64"
                except (ValueError, TypeError):
                    unique_lower = set(series.str.lower().unique())
                    if unique_lower <= {"true", "false", "yes", "no", "1", "0"}:
                        bq_type = "BOOL"

        if bq_type is None:
            type_map = {"int64": "INT64", "float64": "FLOAT64", "bool": "BOOL"}
            bq_type = type_map.get(str(series.dtype), "STRING")

        schema.append(
            bigquery.SchemaField(
                clean_name, bq_type, mode="NULLABLE", description=col
            )
        )
    return schema
