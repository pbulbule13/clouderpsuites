from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GCP_PROJECT: str
    GCP_LOCATION: str = "us-central1"
    GEMINI_API_KEY: str
    GOOGLE_CLIENT_ID: str

    GOOGLE_SHEETS_CLIENT_ID: str = ""
    GOOGLE_SHEETS_CLIENT_SECRET: str = ""

    SERVICE_ACCOUNT_KEY_PATH: str = "service-account-key.json"

    @field_validator("GOOGLE_CLIENT_ID")
    @classmethod
    def google_client_id_must_be_set(cls, v: str) -> str:
        if not v:
            raise ValueError("GOOGLE_CLIENT_ID must be set for audience validation")
        return v

    ALLOWED_EMAILS: list[str] = []
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    ALLOWED_HOSTS: list[str] = ["*"]
    BQ_DATASET_PREFIX: str = "t2md_user_"
    MAX_ROWS_PER_IMPORT: int = 100_000
    MAX_COLUMNS_PER_IMPORT: int = 200
    MAX_DATASETS_PER_USER: int = 5
    MAX_QUERY_BYTES_SCANNED: int = 1_073_741_824  # 1 GB
    MAX_QUERIES_PER_DAY: int = 100
    GEMINI_MODEL: str = "gemini-2.5-flash"
    CONVERSATION_CONTEXT_TURNS: int = 10
    CONVERSATION_RETENTION_DAYS: int = 90

    class Config:
        env_file = ".env"


settings = Settings()
