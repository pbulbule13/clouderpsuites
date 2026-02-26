import pandas as pd
from google import genai
from google.genai import types

from app.config import settings
from app.query.sql_generator import SQLResponse

ANSWER_PROMPT = """You are a helpful data analyst. Given a user's question, the SQL query
that was run, and the query results, provide a clear, concise natural language answer.

RULES:
1. Lead with the direct answer to the question.
2. Include relevant numbers with appropriate formatting (commas, currency symbols, percentages).
3. If the data shows interesting patterns, briefly mention them.
4. Keep it conversational but professional.
5. If results are truncated, mention that more data is available.
6. Do NOT repeat the SQL query in your answer.

Question: {question}
SQL: {sql}
Results ({row_count} rows{truncated}):
{results_preview}

Provide a natural language answer:"""


class ResultFormatter:
    async def format_answer(
        self,
        question: str,
        sql_response: SQLResponse,
        df: pd.DataFrame,
        client: genai.Client,
    ) -> str:
        truncated = ", showing first 20" if len(df) > 20 else ""
        preview = df.head(20).to_string(index=False)

        prompt = ANSWER_PROMPT.format(
            question=question,
            sql=sql_response.sql,
            row_count=len(df),
            truncated=truncated,
            results_preview=preview,
        )

        response = await client.aio.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.3),
        )

        return response.text
