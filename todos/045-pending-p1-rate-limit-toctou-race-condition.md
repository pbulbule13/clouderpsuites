---
status: complete
priority: p1
issue_id: "045"
tags: [code-review, security, concurrency]
dependencies: []
---

# Rate Limit TOCTOU Race Condition (Reopened from #009)

## Problem Statement
The rate limiting in `_check_rate_limit` reads the counter, checks it, then writes the increment as two separate Firestore operations. Concurrent requests from the same user can all read the same counter value, pass the check, and increment -- bypassing the daily 100-query limit. This creates a financial risk through uncontrolled BigQuery and Gemini API costs.

## Findings
- **Source:** Security Sentinel, Performance Oracle, Python Reviewer, Architecture Strategist (4 agents independently flagged this)
- **File:** `backend/app/query/service.py`, lines 207-222
- Previous todo-009 marked "complete" but the implementation has a classic check-then-act race
- Two concurrent requests both read `queries_today=99`, both pass, both write 100
- No Firestore transaction is used

## Proposed Solutions

### Option A: Firestore transaction (Recommended)
```python
@firestore.async_transactional
async def _txn(transaction, ref):
    doc = await ref.get(transaction=transaction)
    data = doc.to_dict()
    if data.get("queries_today", 0) >= settings.MAX_QUERIES_PER_DAY:
        raise QueryLimitExceededError()
    transaction.update(ref, {"queries_today": firestore.Increment(1)})
```
- **Effort:** Small
- **Risk:** Low

### Option B: Firestore Increment without transaction
Use `FieldValue.increment(1)` and check after. Slightly less safe but simpler.
- **Effort:** Small
- **Risk:** Medium (small window for bypass)

## Recommended Action
Option A -- atomic transaction

## Technical Details
- **Affected files:** `backend/app/query/service.py`
- **Components:** Rate limiting, Firestore

## Acceptance Criteria
- [ ] Rate limit check and increment are atomic (Firestore transaction)
- [ ] Concurrent requests from same user cannot exceed daily limit
- [ ] Day rollover still works correctly

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Reopened from todo-009 | Implementation had TOCTOU despite being marked complete |
