---
status: pending
priority: p2
issue_id: "016"
tags: [code-review, architecture, dependency-injection]
dependencies: []
---

# Feedback Endpoint Bypasses Dependency Injection

## Problem Statement
The `/feedback` endpoint directly accesses `request.app.state.firestore_client` and contains raw Firestore logic in the router, violating the layered architecture.

## Findings
- **Source:** Python Reviewer
- **File:** `backend/app/query/router.py`, lines 37-55
- Inline import: `from google.cloud import firestore as fs` (unused alias)
- Bypasses `Depends()` pattern used everywhere else

## Proposed Solutions

### Option A: Move to QueryService or FeedbackService (Recommended)
Create a service method and inject via `Depends`.
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria
- [ ] Feedback logic moved to service layer
- [ ] Uses dependency injection pattern
- [ ] Dead import removed

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Consistency fix |
