---
status: pending
priority: p2
issue_id: "014"
tags: [code-review, security, sql-validation]
dependencies: ["002"]
---

# SQL Keyword Blocking Bypassable

## Problem Statement
Keyword blocking uses space-delimited matching, bypassable with tabs, newlines, comments, parentheses, and Unicode whitespace.

## Findings
- **Source:** Security Sentinel
- **File:** `backend/app/query/sql_validator.py`, lines 24-28
- Tab/newline/comment bypass: `\tDROP\tTABLE`, `/**/DROP/**/TABLE`
- Missing keywords: CALL, EXECUTE, EXEC, LOAD DATA, CREATE FUNCTION/PROCEDURE

## Proposed Solutions

### Option A: Use regex word boundaries + rely on AST check (Recommended)
```python
import re
pattern = r'\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|GRANT|REVOKE|MERGE|CALL|EXECUTE|EXEC)\b'
if re.search(pattern, sql, re.IGNORECASE):
    errors.append(...)
```
Primary enforcement via `isinstance(parsed, sqlglot.exp.Select)`.
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Keyword blocking uses regex word boundaries
- [ ] All dangerous BigQuery operations blocked
- [ ] AST check is primary enforcement, keywords are defense-in-depth

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Defense in depth |
