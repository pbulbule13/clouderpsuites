import json
from dataclasses import dataclass

from google.cloud import bigquery

from app.common.async_utils import run_sync
from app.common.exceptions import SQLValidationError
from app.config import settings
from app.datasets.service import DatasetService
from app.query.conversation_service import ConversationService
from app.query.rate_limit_service import RateLimitService
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
        if self.data is not None:
            d["data"] = self.data
        return json.dumps(d)


class QueryService:
    def __init__(
        self,
        sql_gen: SQLGenerator,
        validator: SQLValidator,
        bq_client: bigquery.Client,
        dataset_service: DatasetService,
        conversations: ConversationService,
        rate_limiter: RateLimitService,
    ):
        self.sql_gen = sql_gen
        self.validator = validator
        self.bq = bq_client
        self.dataset_service = dataset_service
        self.conversations = conversations
        self.rate_limiter = rate_limiter
        self.formatter = ResultFormatter()

    async def process_question(
        self,
        user_id: str,
        dataset_id: str,
        question: str,
        conversation_id: str,
    ):
        # Check rate limit
        await self.rate_limiter.check_rate_limit(user_id)

        # Load dataset metadata
        dataset_meta = await self.dataset_service.get_dataset_schema(
            user_id, dataset_id
        )
        if not dataset_meta:
            yield QueryEvent(type="error", content="Dataset not found")
            return

        # Build schema context
        user_dataset = DatasetService.user_dataset_name(user_id)
        schema_context = self.sql_gen.build_schema_context(
            dataset_meta, settings.GCP_PROJECT, user_dataset
        )

        # Load conversation history
        history = await self.conversations.get_history(user_id, conversation_id)

        yield QueryEvent(type="thinking", content="Analyzing your question...")

        # Generate SQL with retry loop
        max_retries = 3
        last_error = None
        sql_response = None
        retry_history = list(history)  # Isolated copy to prevent prompt injection

        for attempt in range(max_retries):
            sql_response = await self.sql_gen.generate_sql(
                question, schema_context, retry_history, settings.GCP_PROJECT, user_dataset
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
                await self.validator.validate(sql_response.sql, user_dataset)
                break
            except SQLValidationError as e:
                last_error = e
                yield QueryEvent(
                    type="thinking",
                    content=f"Fixing query (attempt {attempt + 2})...",
                )
                # Do NOT feed failed SQL back -- prevents prompt injection feedback loop
                retry_history.append(
                    {
                        "role": "user",
                        "content": "The previous query was invalid. Please try a different approach to answer the original question.",
                    }
                )
        else:
            yield QueryEvent(
                type="error",
                content="Could not generate a valid query after multiple attempts.",
            )
            return

        # Execute query with safety limit to prevent unbounded result materialization
        MAX_RESULT_ROWS = 10_000
        safe_sql = f"SELECT * FROM ({sql_response.sql}) _t LIMIT {MAX_RESULT_ROWS}"
        yield QueryEvent(type="thinking", content="Running query...")
        try:
            rows = await run_sync(self.bq.query_and_wait, safe_sql)
            df = await run_sync(rows.to_dataframe)
        except Exception:
            yield QueryEvent(type="error", content="Query execution failed. Please try rephrasing your question.")
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
        await self.conversations.save_turn(
            user_id, conversation_id, question, answer, sql_response.sql
        )

    async def save_feedback(
        self, user_id: str, conversation_id: str, turn_id: str, feedback: str
    ):
        await self.conversations.save_feedback(
            user_id, conversation_id, turn_id, feedback
        )
