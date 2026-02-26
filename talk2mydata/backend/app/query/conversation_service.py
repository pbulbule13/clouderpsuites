from google.cloud import firestore
from google.cloud.firestore import AsyncClient

from app.common.firestore_paths import conversation_ref, turns_col
from app.config import settings


class ConversationService:
    def __init__(self, db: AsyncClient):
        self.db = db

    async def get_history(self, user_id: str, conv_id: str) -> list[dict]:
        """Fetch most recent turns (descending) then reverse to chronological order."""
        docs = (
            turns_col(self.db, user_id, conv_id)
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(settings.CONVERSATION_CONTEXT_TURNS)
            .stream()
        )
        turns = []
        async for doc in docs:
            turns.append(doc.to_dict())
        turns.reverse()
        history = []
        for turn in turns:
            history.append({"role": "user", "content": turn["question"]})
            history.append({"role": "model", "content": turn["answer"]})
        return history

    async def save_turn(
        self,
        user_id: str,
        conv_id: str,
        question: str,
        answer: str,
        sql: str,
    ):
        await turns_col(self.db, user_id, conv_id).add(
            {
                "question": question,
                "answer": answer,
                "sql": sql,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
        )

    async def save_feedback(
        self, user_id: str, conv_id: str, turn_id: str, feedback: str
    ):
        turn_ref = turns_col(self.db, user_id, conv_id).document(turn_id)
        await turn_ref.update({"feedback": feedback})
