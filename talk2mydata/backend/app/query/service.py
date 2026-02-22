import json
from dataclasses import dataclass

from google.cloud import bigquery, firestore
from google.cloud.firestore import AsyncClient

from app.common.exceptions import SQLValidationError
from app.config import settings
from app.datasets.service import DatasetService
from app.query.result_formatter import ResultFormatter
from app.query.sql_generator import SQLGenerator
from app.query.sql_validator import SQLValidator


@dataclass
class QueryEvent:
    type: str  # "thinking" | "sql" | "data" | "answer" | "error" | "chart"
    content: str
    data: dict | None = None

    def to_json(self) -> str:
        d = {"type": self.type, "content": self.content}
        if self.data:
            d["data"] = self.data
        return json.dumps(d)


class QueryService:
    def __init__(
        self,
        sql_gen: SQLGenerator,
        validator: SQLValidator,
        bq_client: bigquery.Client,
        db: AsyncClient,
        dataset_service: DatasetService,
    ):
        self.sql_gen = sql_gen
        self.validator = validator
        self.bq = bq_client
        self.db = db
        self.dataset_service = dataset_service
        self.formatter = ResultFormatter()

    async def process_question(
        self,
        user_id: str,
        dataset_id: str,
        question: str,
        conversation_id: str,
    ):
        # Load dataset metadata
        dataset_meta = await self.dataset_service.get_dataset_schema(
            user_id, dataset_id
        )
        if not dataset_meta:
            yield QueryEvent(type="error", content="Dataset not found")
            return

        # Build schema context
        user_dataset = f"{settings.BQ_DATASET_PREFIX}{user_id[:20]}"
        schema_context = self.sql_gen.build_schema_context(
            dataset_meta, settings.GCP_PROJECT, user_dataset
        )

        # Load conversation history
        history = await self._get_conversation_history(user_id, conversation_id)

        yield QueryEvent(type="thinking", content="Analyzing your question...")

        # Generate SQL with retry loop
        max_retries = 3
        last_error = None
        sql_response = None

        for attempt in range(max_retries):
            sql_response = await self.sql_gen.generate_sql(
                question, schema_context, history, settings.GCP_PROJECT, user_dataset
            )

            if not sql_response.sql:
                yield QueryEvent(type="answer", content=sql_response.reasoning)
                return

            yield QueryEvent(
                type="sql",
                content=sql_response.sql,
                data={
                    "reasoning": sql_response.reasoning,
                    "confidence": sql_response.confidence,
                },
            )

            # Validate
            try:
                self.validator.validate(sql_response.sql, user_dataset)
                break
            except SQLValidationError as e:
                last_error = e
                yield QueryEvent(
                    type="thinking",
                    content=f"Fixing query (attempt {attempt + 2})...",
                )
                history.append({"role": "model", "content": sql_response.sql})
                history.append(
                    {
                        "role": "user",
                        "content": f"That SQL had errors: {e.errors}. Fix it.",
                    }
                )
        else:
            yield QueryEvent(
                type="error",
                content=f"Could not generate a valid query: {last_error.errors}",
            )
            return

        # Execute query
        yield QueryEvent(type="thinking", content="Running query...")
        try:
            rows = self.bq.query_and_wait(sql_response.sql)
            df = rows.to_dataframe()
        except Exception as e:
            yield QueryEvent(type="error", content=f"Query execution failed: {e}")
            return

        # Format results
        result_data = {
            "columns": list(df.columns),
            "rows": df.head(100).to_dict(orient="records"),
            "total_rows": len(df),
            "truncated": len(df) > 100,
        }
        yield QueryEvent(type="data", content="", data=result_data)

        # Generate natural language answer
        answer = await self.formatter.format_answer(
            question, sql_response, df, self.sql_gen.client
        )
        yield QueryEvent(type="answer", content=answer)

        # Suggest visualization
        if sql_response.visualization and len(df) > 1:
            yield QueryEvent(
                type="chart",
                content="",
                data={
                    "config": sql_response.visualization,
                    "rows": df.head(50).to_dict(orient="records"),
                },
            )

        # Save to conversation history
        await self._save_conversation_turn(
            user_id, conversation_id, question, answer, sql_response.sql
        )

    async def _get_conversation_history(
        self, user_id: str, conv_id: str
    ) -> list[dict]:
        docs = (
            self.db.collection("users")
            .document(user_id)
            .collection("conversations")
            .document(conv_id)
            .collection("turns")
            .order_by("created_at")
            .limit(settings.CONVERSATION_CONTEXT_TURNS)
            .stream()
        )
        history = []
        async for doc in docs:
            turn = doc.to_dict()
            history.append({"role": "user", "content": turn["question"]})
            history.append({"role": "model", "content": turn["answer"]})
        return history

    async def _save_conversation_turn(
        self,
        user_id: str,
        conv_id: str,
        question: str,
        answer: str,
        sql: str,
    ):
        await (
            self.db.collection("users")
            .document(user_id)
            .collection("conversations")
            .document(conv_id)
            .collection("turns")
            .add(
                {
                    "question": question,
                    "answer": answer,
                    "sql": sql,
                    "created_at": firestore.SERVER_TIMESTAMP,
                }
            )
        )
