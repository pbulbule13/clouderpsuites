---
status: complete
priority: p1
issue_id: "002"
tags: [code-review, security, sql-injection]
dependencies: []
---

# SQL Validator Bypass: Substring-Based Dataset Access Check

## Problem Statement
The SQL validator uses `in` substring matching to verify dataset access, which can be bypassed if one user's dataset ID is a prefix/substring of another's.

## Findings
- **Source:** Security Sentinel, Python Reviewer
- **File:** `talk2mydata/backend/app/query/sql_validator.py`, lines 43-46
- **Code:** `if allowed_dataset and allowed_dataset not in table_str:`
- Substring check means `t2md_user_abc123` would match `t2md_user_abc123_evil`
- Combined with user ID truncation (20 chars), collision risk is elevated
- String representation from sqlglot may vary in quoting/formatting

## Proposed Solutions

### Option A: AST-based exact match (Recommended)
```python
for table in parsed.find_all(sqlglot.exp.Table):
    if table.db != expected_dataset_name or table.catalog != expected_project:
        errors.append(f"Unauthorized table access: {table}")
```
- **Pros:** Precise, cannot be bypassed by formatting tricks
- **Cons:** Requires understanding sqlglot's AST structure
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria
- [ ] Dataset access check uses exact AST component matching
- [ ] Table references with similar-prefix dataset names are rejected
- [ ] Backtick-escaped or multi-part identifiers are handled correctly

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Cross-tenant data access risk |
