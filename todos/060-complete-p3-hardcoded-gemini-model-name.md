---
status: complete
priority: p3
issue_id: "060"
tags: [code-review, quality, configuration]
dependencies: []
---

# Hardcoded Gemini Model Name in Two Files

## Problem Statement
The Gemini model name `"gemini-2.5-flash"` is hardcoded in `sql_generator.py` and `result_formatter.py`. Changing the model requires code changes in two places.

## Findings
- **Source:** Python Reviewer (M4), Architecture Strategist (T)
- **Files:** `backend/app/query/sql_generator.py` (line 108), `backend/app/query/result_formatter.py` (line 46)

## Proposed Solutions
Add `GEMINI_MODEL: str = "gemini-2.5-flash"` to `Settings` and use it in both files.
- **Effort:** Small

## Acceptance Criteria
- [ ] Model name configured via `Settings.GEMINI_MODEL`
- [ ] Both files reference the config value

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
