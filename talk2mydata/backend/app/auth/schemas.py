from pydantic import BaseModel


class VerifyTokenRequest(BaseModel):
    id_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    datasets_count: int
    queries_today: int
