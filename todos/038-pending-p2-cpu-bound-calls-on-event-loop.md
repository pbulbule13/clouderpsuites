---
status: pending
priority: p2
issue_id: "038"
tags: [code-review, performance, async, p1-fix-review]
dependencies: ["003"]
---

# CPU-Bound Calls Not Wrapped in run_sync

## Problem Statement
The async conversion wrapped all network I/O calls but missed CPU-bound operations that can stall the event loop during large data imports: `infer_bigquery_schema()` and `pd.concat()` in `ConnectorService`.

## Findings
- **Source:** Performance Oracle (P1 Fix Review)
- `connectors/service.py:67` — `infer_bigquery_schema(full_df)` iterates every column with `pd.to_numeric()` on up to 100K rows
- `connectors/service.py:60` — `pd.concat(all_chunks)` allocates and copies large DataFrames
- Both run directly on the event loop thread during data import
- For a 100K-row, 50-column import, these can take hundreds of milliseconds

## Proposed Solutions

### Option A: Wrap both in run_sync (Recommended)
```python
full_df = await run_sync(pd.concat, all_chunks, ignore_index=True)
schema = await run_sync(infer_bigquery_schema, full_df)
```
- **Effort:** Trivial (2 lines)
- **Risk:** None

## Acceptance Criteria
- [ ] `pd.concat` wrapped in `run_sync` in connector service
- [ ] `infer_bigquery_schema` wrapped in `run_sync` in connector service
- [ ] No CPU-heavy pandas operations run on the event loop

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | CPU-bound ops matter for event loop health too, not just I/O |
