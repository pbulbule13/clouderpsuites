---
status: pending
priority: p2
issue_id: "010"
tags: [code-review, security, dos, sse]
dependencies: []
---

# SSE Stream Has No Timeout or Connection Limits

## Problem Statement
SSE connections have no maximum duration, no per-user concurrent limit, and no heartbeat. With 2 gunicorn workers, 2 slow queries block all users.

## Findings
- **Source:** Security Sentinel
- **File:** `backend/app/query/router.py`, lines 19-24
- No timeout, no heartbeat, no concurrent connection limit
- 2 workers in Dockerfile = trivial DoS

## Proposed Solutions

### Option A: Add timeout + connection limits
- Per-stream 60-second timeout
- Max 3 concurrent SSE connections per user
- Heartbeat pings every 15 seconds
- Increase workers or use async-native server
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria
- [ ] SSE streams timeout after configurable duration
- [ ] Stale connections detected via heartbeat
- [ ] Per-user concurrent connection limit enforced

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | DoS prevention |
