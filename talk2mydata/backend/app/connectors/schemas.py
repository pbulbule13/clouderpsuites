from pydantic import BaseModel, Field, model_validator


class ConnectRequest(BaseModel):
    name: str = Field(max_length=200)
    connector_type: str = Field(max_length=50)
    credentials: dict = {}
    settings: dict = {}

    selected_sheets: list[str] | None = None

    @model_validator(mode="after")
    def strip_secrets_from_credentials(self):
        """Prevent client_id/client_secret from being sent by the frontend."""
        for key in ("client_id", "client_secret"):
            self.credentials.pop(key, None)
        return self


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
