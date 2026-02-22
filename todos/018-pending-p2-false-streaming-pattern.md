---
status: complete
priority: p2
issue_id: "018"
tags: [code-review, performance, patterns]
dependencies: []
---

# False Streaming Pattern in extract_data

## Problem Statement
`extract_data` loads the entire sheet via `get_all_values()` then "chunks" the already-in-memory data. The caller immediately re-concatenates all chunks. Double memory usage for no benefit.

## Findings
- **Source:** Python Reviewer
- **File:** `backend/app/connectors/adapters/google_sheets.py`, lines 63-74
- `get_all_values()` loads everything at once
- Chunked yielding is an illusion of backpressure
- `ConnectorService.connect_and_ingest` re-concatenates chunks immediately

## Proposed Solutions

### Option A: Simplify to single DataFrame return (Recommended)
Remove the fake chunking, return a single DataFrame.
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria
- [ ] Data loaded once, returned as single DataFrame
- [ ] No unnecessary chunking/re-concatenation

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Simplification |
