---
status: pending
priority: p2
issue_id: "015"
tags: [code-review, dead-code, cleanup]
dependencies: []
---

# Dead Code Cleanup

## Problem Statement
Multiple files, classes, and imports exist but are never used, creating confusion and maintenance burden.

## Findings
- **Source:** Code Simplicity Reviewer, Python Reviewer
- **Dead files:** `common/bigquery_client.py`, `common/firestore_client.py`, `common/gemini_client.py`, `middleware/cors.py`
- **Dead classes:** `VerifyTokenRequest` (auth/schemas.py), `DatasetLimitExceededError`, `QueryLimitExceededError` (exceptions.py)
- **Dead imports:** `DatasetNotFoundError` in datasets/router.py
- **Dead method:** `getStreamUrl` in frontend/lib/api-client.ts
- **Dead page:** `frontend/app/(auth)/callback/page.tsx`
- **Empty test dirs:** `tests/test_connectors/`, `tests/test_datasets/`, `tests/test_query/`

## Proposed Solutions

### Option A: Delete all dead code (Recommended)
Remove all listed files, classes, and imports.
- **Effort:** Small
- **Risk:** None (verified unused)
- **Impact:** ~89 LOC + 8 files removed

## Acceptance Criteria
- [ ] All dead files deleted
- [ ] All dead classes/imports removed
- [ ] No unused code remains

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | ~89 LOC removable |
