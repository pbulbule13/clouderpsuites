from pydantic import BaseModel


class ColumnSchema(BaseModel):
    name: str
    type: str
    original_name: str


class DatasetResponse(BaseModel):
    id: str
    name: str
    table_name: str
    source_type: str
    source_url: str
    row_count: int | None
    columns: list[ColumnSchema]
    status: str


class DatasetListResponse(BaseModel):
    datasets: list[DatasetResponse]
