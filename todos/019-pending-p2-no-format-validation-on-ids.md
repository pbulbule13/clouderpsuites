---
status: complete
priority: p2
issue_id: "019"
tags: [code-review, security, validation]
dependencies: []
---

# No Format Validation on dataset_id/conversation_id

## Problem Statement
`AskRequest.dataset_id` and `conversation_id` accept arbitrary strings with no length limits or format constraints, risking Firestore path manipulation.

## Findings
- **Source:** Security Sentinel
- **File:** `backend/app/query/service.py` (AskRequest schema)
- No regex pattern, no max_length
- Malformed IDs could cause unexpected Firestore behavior

## Proposed Solutions

### Option A: Add Field validation (Recommended)
```python
dataset_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,64}$")
conversation_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,64}$")
```
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria
- [ ] dataset_id and conversation_id have format + length validation
- [ ] Malformed IDs return 422

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Input validation |
