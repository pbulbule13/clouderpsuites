---
status: pending
priority: p2
issue_id: "050"
tags: [code-review, security, validation]
dependencies: []
---

# FeedbackRequest Missing Pattern Validation on IDs

## Problem Statement
`FeedbackRequest` validates `feedback` with a pattern but does not validate `conversation_id` and `turn_id`, unlike `AskRequest` which validates both. An attacker could inject Firestore path traversal characters into the IDs.

## Findings
- **Source:** Security Sentinel (MEDIUM-06)
- **File:** `backend/app/query/schemas.py`, lines 10-13
- `conversation_id: str` and `turn_id: str` have no pattern validation
- IDs used directly in Firestore path: `.document(conversation_id).collection("turns").document(turn_id)`
- `AskRequest` properly validates with `pattern=r"^[a-zA-Z0-9_-]+$"`

## Proposed Solutions

### Option A: Add pattern validation (Recommended)
```python
conversation_id: str = Field(pattern=r"^[a-zA-Z0-9_-]+$")
turn_id: str = Field(pattern=r"^[a-zA-Z0-9_-]+$")
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Both IDs validated with alphanumeric pattern
- [ ] Firestore path traversal characters rejected

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
