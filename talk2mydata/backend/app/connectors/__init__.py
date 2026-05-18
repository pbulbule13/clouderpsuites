# Side-effect imports: each adapter module runs @ConnectorRegistry.register at
# import time. Listed here so the registry is populated whenever app.connectors
# is imported, and so main.lifespan() can assert the registry is complete at boot.
from app.connectors.adapters import (  # noqa: F401
    csv_connector,
    excel_connector,
    google_sheets,
    json_connector,
    parquet_connector,
)
