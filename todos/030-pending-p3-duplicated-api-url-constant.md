---
status: pending
priority: p3
issue_id: "030"
tags: [code-review, dry, frontend]
dependencies: []
---

# Duplicated API_URL Constant

## Problem Statement
`API_URL` is defined in both `lib/api-client.ts` and `chat/[datasetId]/page.tsx`. If the env var name or default changes, one could be missed.

## Findings
- **Source:** Code Simplicity Reviewer
- **Files:** `frontend/lib/api-client.ts` line 3, `frontend/app/(app)/chat/[datasetId]/page.tsx` line 11
- Same constant defined in two places

## Proposed Solutions
Export `API_URL` from `api-client.ts` and import it in the chat page.
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria
- [ ] Single source of truth for API_URL

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | DRY principle |
