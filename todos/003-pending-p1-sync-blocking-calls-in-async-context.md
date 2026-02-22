---
status: complete
priority: p1
issue_id: "003"
tags: [code-review, performance, async, event-loop]
dependencies: []
---

# Sync Blocking Calls in Async Context (Event Loop Starvation)

## Problem Statement
Multiple synchronous SDK calls (gspread, BigQuery, Google OAuth) are called directly inside async methods, blocking the entire asyncio event loop. With only 2 gunicorn workers, this freezes the server under any real concurrency.

## Findings
- **Source:** Python Reviewer, Performance Oracle
- **Files affected:**
  - `backend/app/connectors/adapters/google_sheets.py` - gspread calls (test_connection, discover_datasets, extract_data, get_schema)
  - `backend/app/datasets/service.py` - BigQuery create_dataset, load_table_from_dataframe, delete_table
  - `backend/app/query/sql_validator.py` - BigQuery dry-run query
  - `backend/app/query/service.py` - BigQuery query_and_wait, to_dataframe
  - `backend/app/middleware/auth.py` - verify_oauth2_token HTTP call

## Proposed Solutions

### Option A: Wrap all sync calls in run_in_executor (Recommended)
```python
async def _run_sync(self, func, *args):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, partial(func, *args))
```
Apply to all blocking calls across the 5 affected files.
- **Pros:** Straightforward, preserves existing sync SDK usage
- **Cons:** Thread pool overhead, need to apply consistently
- **Effort:** Medium
- **Risk:** Low

### Option B: Switch to async-native SDKs
Use `google-cloud-bigquery` async methods where available.
- **Pros:** True async, better performance
- **Cons:** Not all SDKs have async support (gspread doesn't)
- **Effort:** Large
- **Risk:** Medium

## Acceptance Criteria
- [ ] No synchronous I/O calls inside async methods
- [ ] Server handles concurrent requests without blocking
- [ ] All 5 affected files updated

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Most widespread issue in codebase |
