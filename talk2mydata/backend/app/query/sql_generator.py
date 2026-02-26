import logging
import re

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """You are a BigQuery SQL expert powering a "Talk to Your Data" chatbot.
Given a database schema and natural language question, generate a valid BigQuery Standard SQL query.

RULES:
1. Use ONLY the tables and columns provided in the schema below.
2. Use fully qualified table names: `{project}.{dataset}.<table_name>`.
3. Use BigQuery Standard SQL dialect.
4. Always specify columns explicitly - never use SELECT *.
5. Add LIMIT 100 unless the user explicitly requests all rows or the query is an aggregation.
6. For aggregations, always include GROUP BY.
7. Never generate destructive SQL (DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE).
8. If the question is ambiguous, make your best interpretation and explain it.
9. If the question cannot be answered from the available data, say so.

DATABASE SCHEMA:
{schema_context}

RESPONSE FORMAT (JSON):
{{
  "reasoning": "step-by-step explanation of your SQL generation logic",
  "sql": "the BigQuery Standard SQL query",
  "confidence": "high|medium|low",
  "visualization_type": "bar|line|pie|table|none",
  "visualization_x_axis": "column_name for x-axis (if chart, else empty string)",
  "visualization_y_axis": "column_name for y-axis (if chart, else empty string)",
  "visualization_title": "suggested chart title (if chart, else empty string)"
}}

If the question cannot be answered with SQL, return:
{{
  "reasoning": "explanation of why",
  "sql": "",
  "confidence": "low",
  "visualization_type": "none",
  "visualization_x_axis": "",
  "visualization_y_axis": "",
  "visualization_title": ""
}}
"""


class SQLResponse(BaseModel):
    reasoning: str = Field(description="Step-by-step reasoning for the SQL generation")
    sql: str = Field(default="", description="The generated BigQuery Standard SQL query")
    confidence: str = Field(default="medium", description="high, medium, or low")
    visualization_type: str = Field(default="none", description="bar, line, pie, table, or none")
    visualization_x_axis: str = Field(default="", description="Column name for x-axis")
    visualization_y_axis: str = Field(default="", description="Column name for y-axis")
    visualization_title: str = Field(default="", description="Suggested chart title")

    @property
    def visualization(self) -> dict | None:
        """Reconstruct the visualization dict for backward compatibility."""
        if self.visualization_type == "none" or not self.visualization_type:
            return None
        return {
            "type": self.visualization_type,
            "x_axis": self.visualization_x_axis,
            "y_axis": self.visualization_y_axis,
            "title": self.visualization_title,
        }


class SQLGenerator:
    def __init__(self, client: genai.Client):
        self.client = client

    def build_schema_context(
        self, dataset_meta: dict, project: str, dataset: str
    ) -> str:
        table_name = dataset_meta["table_name"]
        columns = dataset_meta["columns"]
        col_lines = "\n".join(
            f"  - {c['name']} ({c['type']}): originally named '{c['original_name']}'"
            for c in columns
        )
        return (
            f"Table: `{project}.{dataset}.{table_name}`\n"
            f"Description: {dataset_meta['name']}\n"
            f"Columns:\n{col_lines}\n"
            f"Row count: {dataset_meta.get('row_count', 'unknown')}"
        )

    @staticmethod
    def _sanitize_question(question: str) -> str:
        """Basic sanitization to mitigate prompt injection attempts."""
        # Strip control characters
        sanitized = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", question)
        # Collapse excessive whitespace
        sanitized = re.sub(r"\s+", " ", sanitized).strip()
        return sanitized

    async def generate_sql(
        self,
        question: str,
        schema_context: str,
        conversation_history: list[dict],
        project: str,
        dataset: str,
    ) -> SQLResponse:
        sanitized_question = self._sanitize_question(question)
        logger.info("Generating SQL for question: %.200s", sanitized_question)

        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            project=project, dataset=dataset, schema_context=schema_context
        )

        contents = []
        for turn in conversation_history:
            contents.append(
                {"role": turn["role"], "parts": [{"text": turn["content"]}]}
            )
        contents.append({"role": "user", "parts": [{"text": sanitized_question}]})

        response = await self.client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0,
                response_mime_type="application/json",
                response_schema=SQLResponse,
            ),
        )

        result = SQLResponse.model_validate_json(response.text)
        if result.sql:
            logger.info("Generated SQL (confidence=%s): %.500s", result.confidence, result.sql)
        return result
