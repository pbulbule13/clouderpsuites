---
status: complete
priority: p2
issue_id: "055"
tags: [code-review, performance]
dependencies: []
---

# No SSE Client Disconnect Detection (Wasted Resources)

## Problem Statement
If a user navigates away during a query, the SSE connection drops but the backend continues executing the BigQuery query, calling Gemini for formatting, and saving conversation history -- wasting BQ and Gemini API costs.

## Findings
- **Source:** Performance Oracle (OPT-10)
- **File:** `backend/app/query/router.py`, lines 27-41
- `event_stream()` generator keeps running after client disconnects
- Expensive operations (BQ query, Gemini call) continue to completion
- No `request.is_disconnected()` check between operations

## Proposed Solutions

### Option A: Check disconnect between events (Recommended)
```python
if await request.is_disconnected():
    logger.info("Client disconnected, stopping stream")
    return
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Client disconnection detected between SSE events
- [ ] Resource-intensive operations stop when client disconnects

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
