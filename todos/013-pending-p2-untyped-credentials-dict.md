---
status: pending
priority: p2
issue_id: "013"
tags: [code-review, type-safety, security]
dependencies: ["005"]
---

# Untyped Credentials/Settings Dicts

## Problem Statement
`ConnectorConfig.credentials`, `ConnectorConfig.settings`, and `ConnectRequest.credentials/settings` are all plain `dict` with no validation. Missing keys cause raw KeyError 500s.

## Findings
- **Source:** Python Reviewer
- **Files:** `backend/app/connectors/ports.py` lines 9-13, `backend/app/connectors/schemas.py` lines 4-8
- No type safety on most sensitive fields (OAuth tokens, secrets)
- Missing key = unhandled 500 error

## Proposed Solutions

### Option A: Typed Pydantic models per connector (Recommended)
Define `GoogleSheetsCredentials` and `GoogleSheetsSettings` models.
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria
- [ ] Connector credentials have typed Pydantic models
- [ ] Missing required fields return 422 with clear error
- [ ] No untyped dicts for sensitive data

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Type safety for security |
