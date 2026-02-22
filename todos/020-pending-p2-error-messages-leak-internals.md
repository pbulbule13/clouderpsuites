---
status: pending
priority: p2
issue_id: "020"
tags: [code-review, security, information-disclosure]
dependencies: []
---

# Error Messages Leak Internal Details

## Problem Statement
Raw exception messages from BigQuery, sqlglot, and internal validators are returned directly to the client, revealing project IDs, dataset names, and implementation details.

## Findings
- **Source:** Security Sentinel
- **Files:** `backend/app/query/service.py` lines 113-114, 123; `backend/app/query/sql_validator.py` line 66
- Raw BigQuery errors, sqlglot parsing errors exposed to client
- Internal project/dataset names visible in error responses

## Proposed Solutions

### Option A: Generic client errors + server-side logging (Recommended)
Return generic messages to client, log details server-side with request_id.
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria
- [ ] Client receives generic error messages
- [ ] Detailed errors logged server-side with request_id
- [ ] No internal IDs/names in client responses

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Information disclosure prevention |
