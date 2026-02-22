---
status: pending
priority: p3
issue_id: "021"
tags: [code-review, cleanup, frontend, dependencies]
dependencies: []
---

# Unused npm Packages

## Problem Statement
4 npm packages are installed but never imported: `ai`, `@ai-sdk/react`, `@tanstack/react-query`, `class-variance-authority`.

## Findings
- **Source:** Code Simplicity Reviewer
- **File:** `frontend/package.json`
- None are imported anywhere in the frontend source
- Adds unnecessary bundle weight and install time

## Proposed Solutions
Remove all 4 packages: `npm uninstall ai @ai-sdk/react @tanstack/react-query class-variance-authority`
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria
- [ ] All 4 packages removed from package.json

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Quick cleanup |
