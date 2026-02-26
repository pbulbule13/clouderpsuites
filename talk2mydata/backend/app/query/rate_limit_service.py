from datetime import datetime, timezone

from google.cloud import firestore
from google.cloud.firestore import AsyncClient

from app.common.exceptions import QueryLimitExceededError
from app.common.firestore_paths import user_ref
from app.config import settings


class RateLimitService:
    def __init__(self, db: AsyncClient):
        self.db = db

    async def check_rate_limit(self, user_id: str):
        """Atomically check daily query count and increment counter."""
        ref = user_ref(self.db, user_id)
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        transaction = self.db.transaction()

        @firestore.async_transactional
        async def _check_and_increment(txn, doc_ref):
            doc = await doc_ref.get(transaction=txn)
            if not doc.exists:
                return
            data = doc.to_dict()
            if data.get("query_date") == today:
                if data.get("queries_today", 0) >= settings.MAX_QUERIES_PER_DAY:
                    raise QueryLimitExceededError()
                txn.update(doc_ref, {"queries_today": data.get("queries_today", 0) + 1})
            else:
                txn.update(doc_ref, {"queries_today": 1, "query_date": today})

        await _check_and_increment(transaction, ref)
