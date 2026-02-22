---
status: pending
priority: p3
issue_id: "025"
tags: [code-review, performance, dependency-injection]
dependencies: []
---

# Services Re-instantiated Per Request

## Problem Statement
Every dependency function creates new service instances on every request. These are stateless objects that could be cached.

## Findings
- **Source:** Python Reviewer
- **File:** `backend/app/dependencies.py`
- `get_query_service()` constructs DatasetService, SQLGenerator, SQLValidator, QueryService fresh per request

## Proposed Solutions
Use `lru_cache` on factory functions or construct services once in lifespan.
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Stateless services reused across requests

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Minor optimization |
