---
status: pending
priority: p2
issue_id: "057"
tags: [code-review, architecture, quality]
dependencies: []
---

# Inconsistent Error Handling Across Routers

## Problem Statement
Three different error handling strategies coexist: connectors router catches domain exceptions, datasets router checks return values manually, query router delegates to SSE events. `DatasetNotFoundError` exists in the exception hierarchy but is never raised. The `GlobalErrorMiddleware` is bypassed because routers manually catch everything.

## Findings
- **Source:** Pattern Recognition (2.2), Architecture Strategist (K)
- **Files:** `connectors/router.py`, `datasets/router.py`, `query/router.py`, `common/exceptions.py`
- Connectors: `except ConnectorError as e: raise HTTPException(400)`
- Datasets: `if not dataset: raise HTTPException(404)` (repeated 3 times)
- Query: `except QueryLimitExceededError: yield SSE error event`
- `DatasetNotFoundError` defined but never raised
- `DatasetLimitExceededError` defined but never raised

## Proposed Solutions

### Option A: Centralized exception handler (Recommended)
Register `app.exception_handler(Talk2MyDataError)` to map all domain exceptions to HTTP responses in one place.
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria
- [ ] Single centralized exception-to-HTTP mapping
- [ ] Services raise domain exceptions, not HTTPException
- [ ] All custom exception classes are used or removed

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
