---
status: pending
priority: p2
issue_id: "059"
tags: [code-review, quality, bug]
dependencies: []
---

# Conversation History Returns Oldest Turns Instead of Newest

## Problem Statement
The conversation history query orders by `created_at` ascending and limits to N turns, returning the OLDEST turns instead of the most recent ones. This means the LLM gets irrelevant old context instead of the latest conversation.

## Findings
- **Source:** Performance Oracle (OPT-3)
- **File:** `backend/app/query/service.py`, lines 163-181
- `.order_by("created_at").limit(settings.CONVERSATION_CONTEXT_TURNS)` -- ascending = oldest
- Should be descending to get most recent turns, then reversed for chronological order

## Proposed Solutions

### Option A: Use descending order + reverse (Recommended)
```python
.order_by("created_at", direction=firestore.Query.DESCENDING)
.limit(settings.CONVERSATION_CONTEXT_TURNS)
# Then reverse the list
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Query uses DESCENDING order to get most recent turns
- [ ] Results reversed for chronological prompt order

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
