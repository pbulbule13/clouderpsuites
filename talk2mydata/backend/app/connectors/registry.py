from app.common.exceptions import ConnectorError
from app.connectors.ports import ConnectorConfig, DataConnector


class ConnectorRegistry:
    _connectors: dict[str, type[DataConnector]] = {}

    @classmethod
    def register(cls, connector_type: str):
        def decorator(connector_cls: type[DataConnector]):
            cls._connectors[connector_type] = connector_cls
            return connector_cls
        return decorator

    @classmethod
    def get_connector(cls, config: ConnectorConfig) -> DataConnector:
        if not cls._connectors:
            raise RuntimeError(
                "ConnectorRegistry is empty - app.connectors was not imported "
                "at startup. Check the side-effect imports in app/connectors/__init__.py."
            )
        connector_cls = cls._connectors.get(config.connector_type)
        if not connector_cls:
            raise ConnectorError(
                config.connector_type,
                f"Unknown connector type. Available: {sorted(cls._connectors)}",
            )
        return connector_cls(config)

    @classmethod
    def list_available(cls) -> list[str]:
        return list(cls._connectors)
