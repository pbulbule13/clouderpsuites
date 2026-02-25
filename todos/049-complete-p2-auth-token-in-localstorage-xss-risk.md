---
status: complete
priority: p2
issue_id: "049"
tags: [code-review, security, frontend]
dependencies: []
---

# Auth Token Stored in localStorage (XSS Token Theft Risk)

## Problem Statement
The Google OAuth ID token is stored in `localStorage`, which is accessible to any JavaScript running on the page. If an XSS vulnerability exists (even via a third-party dependency), an attacker can steal the token and impersonate the user. Additionally, `isAuthenticated()` only checks token presence, not expiry -- expired tokens pass the guard.

## Findings
- **Source:** Security Sentinel (MEDIUM-02), TypeScript Reviewer (C6)
- **Files:** `frontend/lib/auth.ts` (lines 1-37), `frontend/app/(app)/layout.tsx`
- Token stored via `localStorage.setItem(TOKEN_KEY, token)`
- `isAuthenticated()` returns `!!getToken()` -- no expiry check
- Google ID tokens expire after 1 hour
- LLM responses rendered in `MessageList` could be a vector

## Proposed Solutions

### Option A: Add token expiry check + consider httpOnly cookies
1. Check `exp` claim in `isAuthenticated()` using existing `jwtDecode`
2. Longer term: migrate to httpOnly cookies for token storage
- **Effort:** Small (expiry check), Large (cookie migration)
- **Risk:** Low

## Acceptance Criteria
- [ ] `isAuthenticated()` checks JWT `exp` claim against current time
- [ ] Expired tokens trigger redirect to login
- [ ] `getUser()` has try-catch around `JSON.parse` for corrupted localStorage

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
