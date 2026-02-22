---
status: pending
priority: p3
issue_id: "022"
tags: [code-review, dead-code, api]
dependencies: []
---

# Stub refresh_dataset Endpoint Does Nothing

## Problem Statement
`POST /datasets/{id}/refresh` reads metadata and returns it unchanged. Frontend button misleads users into thinking re-import is happening.

## Findings
- **Source:** Code Simplicity Reviewer, Python Reviewer
- **Files:** `backend/app/datasets/router.py` lines 48-58, `backend/app/datasets/service.py` lines 92-97
- Returns `{"status": "refreshing"}` but nothing actually refreshes

## Proposed Solutions
Remove endpoint and frontend button until actual re-import is implemented.
- **Effort:** Small
- **Risk:** None (no functionality lost)

## Acceptance Criteria
- [ ] Stub endpoint removed or implemented
- [ ] Frontend refresh button removed if endpoint removed

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Remove misleading UX |
