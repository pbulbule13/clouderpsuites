from typing import Type

from app.connectors.ports import ConnectorConfig, DataConnector


class ConnectorRegistry:
    _connectors: dict[str, Type[DataConnector]] = {}

    @classmethod
    def register(cls, connector_type: str):
        def decorator(connector_cls: Type[DataConnector]):
            cls._connectors[connector_type] = connector_cls
            return connector_cls
        return decorator

    @classmethod
    def get_connector(cls, config: ConnectorConfig) -> DataConnector:
        connector_cls = cls._connectors.get(config.connector_type)
        if not connector_cls:
            raise ValueError(
                f"Unknown connector: {config.connector_type}. "
                f"Available: {list(cls._connectors.keys())}"
            )
        return connector_cls(config)

    @classmethod
    def list_available(cls) -> list[str]:
        return list(cls._connectors.keys())
