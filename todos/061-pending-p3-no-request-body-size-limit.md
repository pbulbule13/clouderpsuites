---
status: pending
priority: p3
issue_id: "061"
tags: [code-review, security]
dependencies: []
---

# No Request Body Size Limit

## Problem Statement
No explicit request body size limit in FastAPI or gunicorn. `ConnectRequest` accepts arbitrary `credentials: dict = {}` and `settings: dict = {}` with no size constraints. Attackers could send large payloads to exhaust memory.

## Findings
- **Source:** Security Sentinel (MEDIUM-07)
- **Files:** `backend/app/main.py`, gunicorn CMD in Dockerfile

## Proposed Solutions
Configure `--limit-request-body` in gunicorn and add `max_length` to string fields.
- **Effort:** Small

## Acceptance Criteria
- [ ] Gunicorn body size limit configured
- [ ] String fields have max_length constraints

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
