# Side-effect import: the adapter module runs @ConnectorRegistry.register at
# import time. Listed here so the registry is populated whenever app.connectors
# is imported, and so main.lifespan() can assert the registry is complete at boot.
from app.connectors.adapters import google_sheets  # noqa: F401
