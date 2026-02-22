from pydantic import BaseModel, model_validator


class ConnectRequest(BaseModel):
    name: str
    connector_type: str
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
