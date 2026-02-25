from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(max_length=1000)
    dataset_id: str = Field(pattern=r"^[a-zA-Z0-9_-]+$")
    conversation_id: str = Field(pattern=r"^[a-zA-Z0-9_-]+$")


class FeedbackRequest(BaseModel):
    conversation_id: str = Field(pattern=r"^[a-zA-Z0-9_-]+$")
    turn_id: str = Field(pattern=r"^[a-zA-Z0-9_-]+$")
    feedback: str = Field(pattern="^(thumbs_up|thumbs_down)$")
