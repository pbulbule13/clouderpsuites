---
status: complete
priority: p2
issue_id: "054"
tags: [code-review, performance, security]
dependencies: []
---

# Unbounded BigQuery Result Materialization (OOM Risk)

## Problem Statement
Query results are fully materialized into a pandas DataFrame with no server-side row limit. A user asking "show me all transactions" on a 100K-row table loads everything into memory, but only 100 rows are sent to the client. This wastes memory and can cause OOM on Cloud Run.

## Findings
- **Source:** Performance Oracle (OPT-2)
- **File:** `backend/app/query/service.py`, lines 126-138
- `rows = await run_sync(self.bq.query_and_wait, sql_response.sql)` -- no limit
- `df = await run_sync(rows.to_dataframe)` -- materializes ALL rows
- Only `df.head(100)` sent to client, `df.head(20)` sent to formatter
- Aggregation queries won't have LIMIT clause

## Proposed Solutions

### Option A: Wrap query with server-side LIMIT (Recommended)
```python
safe_sql = f"SELECT * FROM ({sql_response.sql}) LIMIT 1000"
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Server-side row limit enforced on all queries
- [ ] Memory usage per query capped at predictable bound

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
