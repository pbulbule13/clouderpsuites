---
status: pending
priority: p3
issue_id: "026"
tags: [code-review, style, pydantic]
dependencies: []
---

# Deprecated Pydantic Config Class

## Problem Statement
Uses deprecated inner `class Config` instead of Pydantic v2's `model_config`.

## Findings
- **Source:** Python Reviewer
- **File:** `backend/app/config.py`, lines 20-21
- `class Config: env_file = ".env"` is Pydantic v1 pattern

## Proposed Solutions
Replace with: `model_config = SettingsConfigDict(env_file=".env")`
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria
- [ ] Uses `model_config = SettingsConfigDict(env_file=".env")`

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Style update |
