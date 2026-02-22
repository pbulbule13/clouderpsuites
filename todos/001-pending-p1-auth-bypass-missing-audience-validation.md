---
status: complete
priority: p1
issue_id: "001"
tags: [code-review, security, authentication]
dependencies: []
---

# Auth Bypass: Missing Audience Validation on OAuth Token

## Problem Statement
The `verify_oauth2_token` call in auth middleware does not pass the `audience` parameter, meaning ANY valid Google ID token from ANY application is accepted. This is a complete authentication bypass.

## Findings
- **Source:** Security Sentinel, Python Reviewer
- **File:** `talk2mydata/backend/app/middleware/auth.py`, line 21
- **Code:** `idinfo = id_token.verify_oauth2_token(token, google_requests.Request())`
- Without `audience=settings.GOOGLE_CLIENT_ID`, tokens from unrelated apps authenticate successfully
- `GOOGLE_CLIENT_ID` defaults to empty string in config, which would still bypass validation

## Proposed Solutions

### Option A: Add audience parameter (Recommended)
```python
idinfo = id_token.verify_oauth2_token(
    token, google_requests.Request(), audience=settings.GOOGLE_CLIENT_ID
)
```
- **Pros:** One-line fix, immediate security improvement
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

### Option B: Add startup validation
Add a startup check that `GOOGLE_CLIENT_ID` is non-empty, combined with Option A.
- **Effort:** Small
- **Risk:** Low

## Recommended Action
Option A + B combined

## Technical Details
- **Affected files:** `backend/app/middleware/auth.py`, `backend/app/config.py`
- **Components:** Auth middleware

## Acceptance Criteria
- [ ] `verify_oauth2_token` includes `audience=settings.GOOGLE_CLIENT_ID`
- [ ] App fails to start if `GOOGLE_CLIENT_ID` is empty/unset
- [ ] Tokens from other apps are rejected with 401

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Critical one-line security fix |
