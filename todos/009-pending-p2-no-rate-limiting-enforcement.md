---
status: pending
priority: p2
issue_id: "009"
tags: [code-review, security, rate-limiting]
dependencies: []
---

# No Rate Limiting Enforcement on Query Endpoint

## Problem Statement
`MAX_QUERIES_PER_DAY: int = 100` is defined in config and `QueryLimitExceededError` exists, but neither is enforced anywhere. Unlimited queries mean unbounded BigQuery and Gemini API costs.

## Findings
- **Source:** Security Sentinel, Code Simplicity Reviewer
- **File:** `backend/app/query/router.py`, lines 11-34
- **File:** `backend/app/config.py`, line 16
- Config setting exists but is dead code
- Denial-of-wallet attack vector

## Proposed Solutions

### Option A: Implement Firestore-based counter (Recommended)
Check and increment query count in `QueryService.process_question()` before generating SQL.
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria
- [ ] Query count tracked per user per day in Firestore
- [ ] Requests exceeding limit return 429
- [ ] Daily reset mechanism exists

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Defense against cost overrun |
