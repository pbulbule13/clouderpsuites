---
status: complete
priority: p2
issue_id: "042"
tags: [code-review, security, error-handling, p1-fix-review]
dependencies: []
---

# Connector Router Leaks Internal Details via ValueError

## Problem Statement
The `connectors/router.py` catch-all `except ValueError as e: raise HTTPException(status_code=400, detail=str(e))` can leak internal information. When `ConnectorRegistry.get_connector()` raises for an unknown connector type, the error message includes the list of all registered connector types, revealing internal implementation details to the client.

## Findings
- **Source:** Pattern Recognition Specialist (P1 Fix Review)
- `connectors/router.py:68` — `str(e)` from `ValueError` exposes `"Unknown connector: {type}. Available: {list(cls._connectors.keys())}"`
- Pre-existing issue, not introduced by P1 fixes
- Also: `sql_validator.py:82` puts raw BQ exception text into `SQLValidationError` — latent risk if future code serializes the exception

## Proposed Solutions

### Option A: Sanitize error messages (Recommended)
Replace `str(e)` with a generic message and log the original:
```python
except ValueError:
    raise HTTPException(status_code=400, detail="Invalid connector configuration")
```
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria
- [ ] Unknown connector type returns generic 400, not internal connector list
- [ ] Original error is logged for server-side debugging

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | Pre-existing issue found during error sanitization audit |
