from google import genai
from google.genai import types
from pydantic import BaseModel, Field

SYSTEM_PROMPT_TEMPLATE = """You are a BigQuery SQL expert powering a "Talk to Your Data" chatbot.
Given a database schema and natural language question, generate a valid BigQuery Standard SQL query.

RULES:
1. Use ONLY the tables and columns provided in the schema below.
2. Use fully qualified table names: `{project}.{dataset}.{table}`.
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
  "visualization": {{
    "type": "bar|line|pie|table",
    "x_axis": "column_name for x-axis (if chart)",
    "y_axis": "column_name for y-axis (if chart)",
    "title": "suggested chart title"
  }}
}}

If the question cannot be answered with SQL, return:
{{
  "reasoning": "explanation of why",
  "sql": "",
  "confidence": "low",
  "visualization": null
}}
"""


class SQLResponse(BaseModel):
    reasoning: str = Field(description="Step-by-step reasoning for the SQL generation")
    sql: str = Field(default="", description="The generated BigQuery Standard SQL query")
    confidence: str = Field(default="medium", description="high, medium, or low")
    visualization: dict | None = Field(
        default=None, description="Suggested chart config"
    )


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

    async def generate_sql(
        self,
        question: str,
        schema_context: str,
        conversation_history: list[dict],
        project: str,
        dataset: str,
    ) -> SQLResponse:
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            project=project, dataset=dataset, schema_context=schema_context
        )

        contents = []
        for turn in conversation_history:
            contents.append(
                {"role": turn["role"], "parts": [{"text": turn["content"]}]}
            )
        contents.append({"role": "user", "parts": [{"text": question}]})

        response = await self.client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0,
                response_mime_type="application/json",
                response_schema=SQLResponse,
            ),
        )

        return SQLResponse.model_validate_json(response.text)
