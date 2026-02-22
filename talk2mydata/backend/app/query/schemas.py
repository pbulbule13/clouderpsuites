from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(max_length=1000)
    dataset_id: str
    conversation_id: str


class FeedbackRequest(BaseModel):
    conversation_id: str
    turn_id: str
    feedback: str = Field(pattern="^(thumbs_up|thumbs_down)$")
