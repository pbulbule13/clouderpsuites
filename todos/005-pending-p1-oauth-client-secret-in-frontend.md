---
status: complete
priority: p1
issue_id: "005"
tags: [code-review, security, oauth, credentials]
dependencies: []
---

# OAuth Client Secret Exposed to Frontend

## Problem Statement
The ConnectRequest schema accepts a freeform `credentials` dict expected to contain `access_token`, `client_id`, and `client_secret`. This means OAuth client secrets must be embedded in client-side JavaScript, completely compromising the secret.

## Findings
- **Source:** Security Sentinel
- **File:** `talk2mydata/backend/app/connectors/adapters/google_sheets.py`, lines 28-35
- **File:** `talk2mydata/backend/app/connectors/schemas.py`, lines 4-9
- Client secret would be visible in browser DevTools/source
- No schema validation on the credentials dict

## Proposed Solutions

### Option A: Server-side OAuth flow (Recommended)
Implement OAuth authorization code flow on the backend. Frontend initiates the flow, backend handles token exchange using the secret stored server-side.
- **Effort:** Large
- **Risk:** Medium

### Option B: Service account approach
Use a GCP service account for Sheets access, eliminating user OAuth entirely.
- **Effort:** Medium
- **Risk:** Low (but limits to sheets shared with service account)

## Acceptance Criteria
- [ ] OAuth client secret never leaves the backend
- [ ] Credentials dict has strict Pydantic schema validation
- [ ] Frontend does not contain or transmit client secrets

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Architectural redesign needed |
