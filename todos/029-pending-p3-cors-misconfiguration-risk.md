---
status: pending
priority: p3
issue_id: "029"
tags: [code-review, security, cors]
dependencies: []
---

# CORS Misconfiguration Risk

## Problem Statement
`CORS_ORIGINS` loaded from environment could be set to `["*"]` in production. Combined with `allow_credentials=True`, this creates a CORS vulnerability. `ALLOWED_HOSTS: ["*"]` is defined but never enforced.

## Findings
- **Source:** Security Sentinel
- **Files:** `backend/app/main.py` lines 29-35, `backend/app/config.py` lines 9-10
- Default is correctly scoped but no production validation
- ALLOWED_HOSTS unused

## Proposed Solutions
Add startup validation that CORS_ORIGINS never contains "*" when credentials enabled. Implement ALLOWED_HOSTS enforcement.
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria
- [ ] CORS_ORIGINS validated at startup
- [ ] ALLOWED_HOSTS enforced or removed

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Config hardening |
