---
status: pending
priority: p2
issue_id: "034"
tags: [code-review, security, configuration, p1-fix-review]
dependencies: ["005"]
---

# Google Sheets OAuth Secrets Default to Empty String

## Problem Statement
Unlike `GOOGLE_CLIENT_ID` (which has a fail-fast validator), `GOOGLE_SHEETS_CLIENT_ID` and `GOOGLE_SHEETS_CLIENT_SECRET` default to empty strings. If not configured, the Sheets connector will fail with a confusing `RefreshError` at runtime instead of a clear configuration error.

## Findings
- **Source:** Security Sentinel + Architecture Strategist (P1 Fix Review)
- `config.py:11-12` — `GOOGLE_SHEETS_CLIENT_ID: str = ""` and `GOOGLE_SHEETS_CLIENT_SECRET: str = ""`
- Empty strings are intentionally optional (Sheets is not always needed), but the failure mode is poor
- `GOOGLE_CLIENT_ID` correctly uses `field_validator` + no default = fail-fast
- Should use `None` instead of `""` to distinguish "not configured" from "empty"

## Proposed Solutions

### Option A: Use None default + runtime check in connector (Recommended)
```python
# config.py
GOOGLE_SHEETS_CLIENT_ID: str | None = None
GOOGLE_SHEETS_CLIENT_SECRET: str | None = None

# google_sheets.py _get_client()
if not settings.GOOGLE_SHEETS_CLIENT_ID or not settings.GOOGLE_SHEETS_CLIENT_SECRET:
    raise ConnectorError("google_sheets", "Server OAuth credentials not configured")
```
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria
- [ ] Sheets secrets use `None` default, not empty string
- [ ] Clear error message when Sheets connector is used without configuration
- [ ] App starts successfully without Sheets secrets (they're optional)

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | Empty-string defaults mask configuration errors |
