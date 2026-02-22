---
status: complete
priority: p2
issue_id: "033"
tags: [code-review, performance, scalability, p1-fix-review]
dependencies: ["003"]
---

# Thread Pool Exhaustion at 3+ Concurrent Users

## Problem Statement
The async conversion uses `asyncio.to_thread()` which relies on Python's default `ThreadPoolExecutor`. On Cloud Run instances with 1-2 vCPUs, the default pool is only 5-6 threads. A single query request consumes 2-4 thread slots sequentially, meaning 3 concurrent users saturate the pool.

## Findings
- **Source:** Performance Oracle (P1 Fix Review)
- Default pool: `min(32, os.cpu_count() + 4)` = 5-6 on typical Cloud Run
- Per-request thread consumption: auth (1) + validator dry-run (1) + query (1) + dataframe (1) = 2-4 slots
- Also add `max_results` to `query_and_wait` as a memory safety cap

## Proposed Solutions

### Option A: Configure thread pool at startup (Recommended)
Add `THREAD_POOL_SIZE` setting and configure in lifespan:
```python
loop = asyncio.get_running_loop()
loop.set_default_executor(ThreadPoolExecutor(max_workers=settings.THREAD_POOL_SIZE))
```
- **Effort:** Small
- **Risk:** Low

### Option B: Use dedicated executors for BQ vs. Sheets
Separate pools to prevent one connector type from starving the other.
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria
- [ ] Thread pool size is configurable via environment variable
- [ ] Default pool size supports at least 10 concurrent users
- [ ] `max_results` parameter added to `query_and_wait` as safety cap

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | Default thread pool is dangerously small on Cloud Run |
