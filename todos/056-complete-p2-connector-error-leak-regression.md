---
status: complete
priority: p2
issue_id: "056"
tags: [code-review, security, regression]
dependencies: []
---

# Connector Router Error Leak REGRESSION (Reopened from #042)

## Problem Statement
The P2 fix in commit `6bd28da` sanitized connector error messages, but commit `4afe0b7` reverted this and re-introduced raw exception details in HTTP responses. The todo-042 was marked "complete" but the fix was undone.

## Findings
- **Source:** Security Sentinel (HIGH-04), Git History Analyzer (confirmed regression)
- **File:** `backend/app/connectors/router.py`, lines 88-91
- Current code: `detail=f"Failed to access spreadsheet: {e}"` -- leaks raw exception
- P2 fix had: `detail="Invalid connector configuration"` -- generic message
- Commit `4afe0b7` reverted the sanitization during bug-fix work

## Proposed Solutions

### Option A: Restore generic error messages (Recommended)
```python
except Exception as e:
    logger.exception("Discover failed for user %s: %s", user_id, e)
    raise HTTPException(status_code=400, detail="Failed to access the spreadsheet. Please check the URL and sharing settings.")
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] No raw exception messages in HTTP responses
- [ ] Full exceptions logged server-side
- [ ] Generic user-facing error messages

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Reopened from todo-042 | P2 fix was reverted in commit 4afe0b7 |
