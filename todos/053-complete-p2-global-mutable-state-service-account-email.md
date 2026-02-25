---
status: complete
priority: p2
issue_id: "053"
tags: [code-review, quality, python]
dependencies: []
---

# Global Mutable State for Service Account Email

## Problem Statement
`SERVICE_ACCOUNT_EMAIL` is a module-level global variable with `global` keyword mutation in `_load_service_account_email()`. This is not thread-safe, untestable without monkeypatching, and violates the DI pattern used elsewhere.

## Findings
- **Source:** Python Reviewer (C2), Pattern Recognition (2.4), Architecture Strategist (X)
- **File:** `backend/app/connectors/adapters/google_sheets.py`, lines 20-48
- Uses `global SERVICE_ACCOUNT_EMAIL` with lazy initialization
- Multiple async tasks could race during initialization
- Cannot be injected or replaced in tests

## Proposed Solutions

### Option A: Replace with `functools.lru_cache` (Recommended)
```python
@functools.lru_cache(maxsize=1)
def _load_service_account_email() -> str:
    ...
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] No `global` keyword usage
- [ ] Service account email cached via `lru_cache` or similar
- [ ] Testable without monkeypatching module globals

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
