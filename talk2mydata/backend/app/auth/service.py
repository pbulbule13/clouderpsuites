from google.cloud import firestore
from google.cloud.firestore import AsyncClient

from app.common.firestore_paths import user_ref


class AuthService:
    def __init__(self, db: AsyncClient):
        self.db = db

    async def ensure_user_exists(self, user_id: str, email: str, name: str) -> dict:
        ref = user_ref(self.db, user_id)
        user_doc = await ref.get()

        if not user_doc.exists:
            user_data = {
                "email": email,
                "name": name,
                "created_at": firestore.SERVER_TIMESTAMP,
                "datasets_count": 0,
                "queries_today": 0,
            }
            await ref.set(user_data)
            return {**user_data, "id": user_id}

        data = user_doc.to_dict()
        await ref.update({"last_login": firestore.SERVER_TIMESTAMP})
        return {**data, "id": user_id}
