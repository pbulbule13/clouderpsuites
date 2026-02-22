from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import AsyncIterator

import pandas as pd


@dataclass
class ConnectorConfig:
    name: str
    connector_type: str
    credentials: dict
    settings: dict


@dataclass
class DatasetInfo:
    id: str
    name: str
    description: str
    row_count: int | None
    columns: list[dict] = field(default_factory=list)


class DataConnector(ABC):
    @abstractmethod
    async def test_connection(self) -> bool: ...

    @abstractmethod
    async def discover_datasets(self) -> list[DatasetInfo]: ...

    @abstractmethod
    async def extract_data(self, dataset_id: str) -> AsyncIterator[pd.DataFrame]: ...

    @abstractmethod
    async def get_schema(self, dataset_id: str) -> list[dict]: ...
