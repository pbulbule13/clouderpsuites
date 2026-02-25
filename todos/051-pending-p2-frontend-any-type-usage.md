---
status: pending
priority: p2
issue_id: "051"
tags: [code-review, quality, typescript]
dependencies: []
---

# Frontend TypeScript: Pervasive `any` Type Usage

## Problem Statement
At least 7 uses of `any` across the frontend codebase defeat TypeScript's type safety. The worst offender is `connect-dialog.tsx` with 5 occurrences. `jwtDecode` returns `Record<string, any>` which propagates untyped data through the auth flow.

## Findings
- **Source:** TypeScript Reviewer (C1-C3), Pattern Recognition (9.1)
- **Files:** `connect-dialog.tsx` (5x), `login/page.tsx` (1x), `lib/jwt.ts` (1x)
- `useState<any[]>([])` for sheets state
- `credentialResponse: any` instead of `CredentialResponse` from `@react-oauth/google`
- `catch (err: any)` instead of `catch (err: unknown)`
- `jwtDecode` returns `Record<string, any>` instead of typed `GoogleJwtPayload`

## Proposed Solutions

### Option A: Define proper types for all `any` usages (Recommended)
1. Create `DiscoveredSheet` interface for connect dialog
2. Use `CredentialResponse` from `@react-oauth/google`
3. Define `GoogleJwtPayload` interface for JWT decode
4. Use `catch (err: unknown)` with `instanceof Error` narrowing
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Zero `any` usage in frontend source files
- [ ] All API responses typed with proper interfaces
- [ ] Error catches use `unknown` with proper narrowing

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
