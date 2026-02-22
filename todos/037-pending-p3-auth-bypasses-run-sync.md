---
status: pending
priority: p3
issue_id: "037"
tags: [code-review, consistency, async, p1-fix-review]
dependencies: ["003"]
---

# auth.py Uses asyncio.to_thread Directly Instead of run_sync

## Problem Statement
`AuthMiddleware` calls `asyncio.to_thread()` directly instead of using the `run_sync` helper that all other async-wrapped calls use. This inconsistency means future instrumentation (tracing, timeout enforcement, concurrency limiting) applied to `run_sync` won't cover auth token verification.

## Findings
- **Source:** Architecture Strategist (P1 Fix Review)
- `auth.py:25` — `await asyncio.to_thread(...)` used directly
- All other files use `from app.common.async_utils import run_sync`
- Functionally identical today, but inconsistent for future maintainability

## Proposed Solutions

### Option A: Use run_sync in auth.py (Recommended)
```python
from app.common.async_utils import run_sync
idinfo = await run_sync(id_token.verify_oauth2_token, token, google_requests.Request(), audience=settings.GOOGLE_CLIENT_ID)
```
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria
- [ ] All `asyncio.to_thread()` calls go through `run_sync` for consistency

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | Consistency matters for future instrumentation |
