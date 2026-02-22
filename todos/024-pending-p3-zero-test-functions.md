---
status: pending
priority: p3
issue_id: "024"
tags: [code-review, testing]
dependencies: []
---

# Zero Test Functions

## Problem Statement
Test directories exist with conftest.py and empty __init__.py files but contain zero actual test functions. Schema inference and SQL validation are trivially testable.

## Findings
- **Source:** Python Reviewer
- **Files:** `backend/tests/` - only conftest.py with unused fixtures
- `schema_inference.py` and `sql_validator.py` are pure-logic, ideal for unit testing

## Proposed Solutions
Write unit tests for at minimum: schema_inference.py, sql_validator.py.
- **Effort:** Medium
- **Risk:** None

## Acceptance Criteria
- [ ] Unit tests exist for schema inference
- [ ] Unit tests exist for SQL validator
- [ ] Tests pass in CI

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Testing needed |
