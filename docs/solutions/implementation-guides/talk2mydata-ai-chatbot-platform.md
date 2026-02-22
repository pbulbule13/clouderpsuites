---
title: "Talk2MyData: AI-Powered Data Chatbot Platform - Full Implementation"
date: 2026-02-21
category: "implementation-guides"
tags: ["next.js", "fastapi", "bigquery", "gemini", "data-chatbot", "full-stack", "sse", "hexagonal-architecture", "text-to-sql"]
components: ["Frontend (Next.js 15)", "Backend (FastAPI)", "BigQuery", "Gemini 2.5 Flash", "Firestore", "Google Sheets Connector", "SQL Query Engine", "Chat UI"]
stack: "Next.js 15, FastAPI, BigQuery, Gemini 2.5 Flash, Firestore, Google Cloud Run"
status: "implemented"
related_docs:
  - docs/plans/2026-02-21-feat-talk2mydata-chatbot-platform-plan.md
---

# Talk2MyData: AI-Powered Data Chatbot Platform

## Overview

Talk2MyData is a production-grade, domain-agnostic platform that lets users connect any data source (starting with Google Sheets), automatically ingest and store data in BigQuery, and ask natural language questions via a chat interface powered by Google Gemini AI. The system converts questions to SQL, executes them, and returns formatted answers with tables, charts, and natural language explanations.

## Architecture

```
Next.js 15 Frontend  →  FastAPI Backend  →  Google Cloud
  - Chat UI (SSE)         - Auth middleware      - Gemini 2.5 Flash (text-to-SQL)
  - Dataset Manager       - Connector registry   - BigQuery (query execution)
  - Charts (Recharts)     - SQL validation        - Firestore (metadata)
  - Google Sign-In        - Query orchestration   - Sheets API (ingestion)
```

**Data Flow:** Google Sheets → gspread → schema inference → BigQuery load → user asks question → Gemini generates SQL → sqlglot + dry-run validation → BigQuery executes → Gemini formats answer → SSE stream to frontend

## Key Implementation Patterns

### 1. App Factory with Lifespan (FastAPI)

Shared GCP clients initialized once at startup, torn down on shutdown:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.bq_client = bigquery.Client(project=settings.GCP_PROJECT)
    app.state.firestore_client = firestore.AsyncClient(project=settings.GCP_PROJECT)
    app.state.genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    yield
    app.state.bq_client.close()
```

**File:** `talk2mydata/backend/app/main.py`

### 2. Hexagonal Connector Architecture

Abstract port + decorator-based registry enables pluggable data sources:

```python
class DataConnector(ABC):
    @abstractmethod
    async def test_connection(self) -> bool: ...
    @abstractmethod
    async def discover_datasets(self) -> list[DatasetInfo]: ...
    @abstractmethod
    async def extract_data(self, dataset_id: str) -> AsyncIterator[pd.DataFrame]: ...

@ConnectorRegistry.register("google_sheets")
class GoogleSheetsConnector(DataConnector):
    # Full implementation with OAuth credentials, chunked extraction
```

**Files:** `backend/app/connectors/ports.py`, `registry.py`, `adapters/google_sheets.py`

### 3. Schema Inference Engine

Automatic type detection from raw DataFrame columns:
- Date patterns: `YYYY-MM-DD`, `MM/DD/YYYY`, ISO 8601 timestamps
- Numeric: `pd.to_numeric()` with INT64 vs FLOAT64 distinction
- Boolean: detects `true/false/yes/no/1/0` sets
- Column sanitization: special chars → underscores, duplicate handling, numeric prefix fix

**File:** `backend/app/datasets/schema_inference.py`

### 4. Multi-Stage SQL Validation (Defense in Depth)

Four-stage pipeline before any SQL touches BigQuery:

| Stage | What it checks | Tool |
|-------|---------------|------|
| 1. Keyword blocking | DROP, DELETE, UPDATE, INSERT, etc. | String matching |
| 2. AST parsing | SELECT-only, valid syntax | sqlglot |
| 3. Dataset access | Only user's own tables | Table reference extraction |
| 4. Cost check | Scan size < 1 GB | BigQuery dry-run |

**File:** `backend/app/query/sql_validator.py`

### 5. Self-Correcting Query Pipeline

If SQL fails validation, errors are fed back to Gemini for self-correction (up to 3 attempts):

```python
for attempt in range(max_retries):
    sql_response = await self.sql_gen.generate_sql(question, schema_context, history, ...)
    try:
        self.validator.validate(sql_response.sql, user_dataset)
        break
    except SQLValidationError as e:
        history.append({"role": "model", "content": sql_response.sql})
        history.append({"role": "user", "content": f"That SQL had errors: {e.errors}. Fix it."})
```

**File:** `backend/app/query/service.py`

### 6. SSE Streaming with Progressive UI Updates

Backend yields typed events; frontend accumulates them on a single assistant message:

```
thinking → sql → data → answer → chart → [DONE]
```

Frontend parses `data: {JSON}\n\n` lines and updates message state progressively.

**Files:** `backend/app/query/router.py`, `frontend/app/(app)/chat/[datasetId]/page.tsx`

### 7. Per-User Data Isolation

Each user gets their own BigQuery dataset (`t2md_user_{userId[:20]}`). SQL validator enforces that generated queries can only reference the authenticated user's dataset.

**File:** `backend/app/datasets/service.py`

## Prevention Strategies

### SQL Injection via AI-Generated Queries
- System prompt restricts to SELECT-only with explicit rules
- sqlglot AST validation rejects non-SELECT statements
- BigQuery dry-run catches semantic errors
- Dataset access check prevents cross-user table references

### Cross-User Data Leaks
- Per-user BigQuery datasets with namespace isolation
- user_id extracted from OAuth token, never from user input
- Firestore subcollections scoped to user document

### BigQuery Cost Runaway
- MAX_QUERY_BYTES_SCANNED: 1 GB per query (dry-run check)
- LIMIT 100 enforced for non-aggregation queries
- Per-user daily query limit: 100 queries
- Dataset size limits: 100K rows, 200 columns, 5 datasets per user

### Prompt Injection
- Fixed system prompt template (not user-modifiable)
- Question length capped at 1,000 characters
- Response validated against Pydantic schema
- SQL re-validated even after model generation

### OAuth Token Security
- Google ID token verification via `google.oauth2.id_token`
- Token extracted from Authorization header only
- 401 auto-redirect on invalid/expired tokens
- CORS restricted to frontend origin in production

## Project Structure

```
talk2mydata/
├── backend/                    # FastAPI (Python 3.12)
│   ├── app/
│   │   ├── main.py            # App factory, lifespan, middleware
│   │   ├── config.py          # Pydantic Settings
│   │   ├── dependencies.py    # DI providers
│   │   ├── middleware/        # Auth, CORS, error handler, request ID
│   │   ├── auth/              # Google Sign-In verification
│   │   ├── connectors/        # Hexagonal connector system
│   │   ├── datasets/          # Schema inference, BigQuery loading
│   │   ├── query/             # SQL generation, validation, streaming
│   │   └── common/            # Shared clients, exceptions
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # Next.js 15 (React 19, TypeScript)
│   ├── app/
│   │   ├── (auth)/login/      # Google OAuth login
│   │   ├── (app)/dashboard/   # Dataset management
│   │   ├── (app)/chat/        # Chat interface with SSE
│   │   └── (app)/settings/    # User preferences
│   ├── components/
│   │   ├── chat/              # Message list, charts, tables, SQL viewer
│   │   ├── connectors/        # Connect dialog, dataset cards
│   │   └── layout/            # Header, sidebar, theme provider
│   ├── lib/                   # API client, auth, types, utils
│   └── Dockerfile
└── docker-compose.yml          # Local development
```

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI Model | Gemini 2.5 Flash | Best price/performance for SQL generation |
| AI SDK | `google-genai` | Official recommended SDK (2026) |
| SQL parsing | sqlglot | Robust BigQuery dialect support |
| Charts | Recharts | React-native, declarative |
| Auth | Google Sign-In → ID token | Leverages Google ecosystem |
| Data isolation | Per-user BigQuery dataset | Strongest isolation model |
| Streaming | SSE | Compatible with Vercel AI SDK patterns |
| Connector pattern | Hexagonal (ports & adapters) | Pluggable, testable, extensible |

## Getting Started

1. Copy `.env.example` to `.env` in both `backend/` and `frontend/`
2. Set GCP credentials: `GCP_PROJECT`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`
3. Run `docker-compose up` from `talk2mydata/`
4. Frontend: http://localhost:3000 | Backend: http://localhost:8080

## Future Extensibility

The connector registry pattern makes adding new data sources straightforward:
1. Create adapter class implementing `DataConnector`
2. Decorate with `@ConnectorRegistry.register("connector_type")`
3. Add frontend UI for connector-specific configuration

Planned connectors: CSV/Excel upload, Salesforce, NetSuite, PostgreSQL/MySQL.
