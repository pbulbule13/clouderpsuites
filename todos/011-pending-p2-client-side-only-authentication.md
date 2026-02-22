---
status: complete
priority: p2
issue_id: "011"
tags: [code-review, security, frontend, authentication]
dependencies: []
---

# Client-Side Only Authentication (No Token Expiration Check)

## Problem Statement
Frontend auth checks only whether a token exists in localStorage. No expiration check, no signature verification, no Next.js middleware for server-side protection.

## Findings
- **Source:** Security Sentinel
- **File:** `frontend/app/(app)/layout.tsx`, lines 12-16
- **File:** `frontend/lib/auth.ts`, lines 35-37
- **File:** `frontend/lib/jwt.ts` - base64 decode only, no verification
- Google ID tokens expire after 1 hour but expiry is never checked
- Any string in localStorage passes `isAuthenticated()`

## Proposed Solutions

### Option A: Add expiration check + Next.js middleware (Recommended)
```typescript
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch { return false; }
}
```
Plus implement Next.js middleware for server-side route protection.
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria
- [ ] Token expiration checked in isAuthenticated()
- [ ] Expired tokens trigger re-login
- [ ] Next.js middleware protects authenticated routes server-side

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Defense in depth |
