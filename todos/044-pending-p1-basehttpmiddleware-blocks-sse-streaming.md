---
status: complete
priority: p1
issue_id: "044"
tags: [code-review, performance, architecture]
dependencies: []
---

# BaseHTTPMiddleware Blocks SSE Streaming Under Concurrency

## Problem Statement
All 3 custom middlewares (`AuthMiddleware`, `GlobalErrorMiddleware`, `RequestIdMiddleware`) extend Starlette's `BaseHTTPMiddleware`, which buffers the entire response body before sending it to the client. This completely defeats SSE streaming for the `/api/v1/query/ask` endpoint and can deadlock the server under concurrent load (~10+ simultaneous SSE connections).

## Findings
- **Source:** Performance Oracle (CRITICAL-1), Python Reviewer (H2)
- **Files:** `backend/app/middleware/auth.py`, `backend/app/middleware/error_handler.py`, `backend/app/middleware/request_id.py`
- `BaseHTTPMiddleware` wraps response body in memory, buffering all SSE events
- Under 10+ concurrent users, the anyio default thread pool (40 threads) can be exhausted
- At 50+ concurrent users, server deadlocks -- every SSE connection holds a thread
- FastAPI docs explicitly warn against `BaseHTTPMiddleware` with streaming responses

## Proposed Solutions

### Option A: Convert to pure ASGI middleware (Recommended)
Replace all 3 middlewares with pure ASGI middleware pattern (`__call__(self, scope, receive, send)`).
- **Pros:** No buffering, true streaming, handles concurrent SSE connections properly
- **Cons:** More verbose code, must handle ASGI protocol directly
- **Effort:** Medium
- **Risk:** Low

### Option B: Convert auth to FastAPI Depends
Move auth checking to a `Depends()` function and keep only error/request-id as middleware.
- **Pros:** Simpler auth code, testable
- **Cons:** Still leaves 2 BaseHTTPMiddleware instances
- **Effort:** Small
- **Risk:** Low

## Recommended Action
Option A for all 3 middlewares

## Technical Details
- **Affected files:** `backend/app/middleware/auth.py`, `error_handler.py`, `request_id.py`
- **Components:** All HTTP middleware, SSE streaming

## Acceptance Criteria
- [ ] All 3 middlewares converted to pure ASGI pattern (no BaseHTTPMiddleware)
- [ ] SSE streaming works with 10+ concurrent connections
- [ ] Auth still validates tokens and sets user_id on scope/state
- [ ] Error handler still catches unhandled exceptions
- [ ] Request ID still propagates through requests

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | BaseHTTPMiddleware is a known footgun for streaming |
