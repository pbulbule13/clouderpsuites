---
status: pending
priority: p2
issue_id: "048"
tags: [code-review, security]
dependencies: []
---

# Missing HTTP Security Headers (HSTS, CSP, X-Frame-Options)

## Problem Statement
Neither the FastAPI backend nor the Next.js frontend sets any security-related HTTP headers. The application is vulnerable to clickjacking, MIME-type sniffing, and lacks defense-in-depth against XSS.

## Findings
- **Source:** Security Sentinel (MEDIUM-01)
- **Files:** `backend/app/main.py`, `frontend/next.config.ts`
- Missing: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`
- `next.config.ts` has no headers configuration

## Proposed Solutions

### Option A: Add security headers middleware to backend + next.config headers
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Backend adds security headers middleware (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- [ ] `next.config.ts` configured with appropriate security headers
- [ ] CSP header allows required Google OAuth and API domains

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
