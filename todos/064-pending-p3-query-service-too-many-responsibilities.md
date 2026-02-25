---
status: pending
priority: p3
issue_id: "064"
tags: [code-review, architecture]
dependencies: []
---

# QueryService Has Too Many Responsibilities (God Object)

## Problem Statement
`QueryService` has 5 dependencies and manages rate limiting, conversation history CRUD, SQL generation orchestration, and feedback storage. The `process_question` method is 115 lines long.

## Findings
- **Source:** Pattern Recognition (2.5), Architecture Strategist (J)
- **File:** `backend/app/query/service.py`

## Proposed Solutions
Extract `ConversationService` for history CRUD and `RateLimitService` for query counting.
- **Effort:** Medium

## Acceptance Criteria
- [ ] Rate limiting extracted to separate service
- [ ] Conversation persistence extracted to separate service/repository
- [ ] QueryService focused on query orchestration

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
