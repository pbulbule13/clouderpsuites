from pydantic import BaseModel


class ConnectRequest(BaseModel):
    name: str
    connector_type: str
    credentials: dict = {}
    settings: dict = {}
    selected_sheets: list[str] | None = None


class DatasetInfoResponse(BaseModel):
    id: str
    name: str
    description: str
    row_count: int | None
    columns: list[dict]


class DiscoverResponse(BaseModel):
    datasets: list[DatasetInfoResponse]


class ConnectResponse(BaseModel):
    datasets: list[dict]
    status: str
