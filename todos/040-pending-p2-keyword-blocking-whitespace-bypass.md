---
status: pending
priority: p2
issue_id: "040"
tags: [code-review, security, sql-injection, p1-fix-review]
dependencies: ["002"]
---

# SQL Keyword Blocking Bypassed by Whitespace/Comments

## Problem Statement
Stage 1 of the SQL validator uses space-delimited keyword matching (`f" {kw} " in f" {sql_upper} "`). This is trivially bypassed by newlines, tabs, or SQL comments (e.g., `DELETE\nFROM`, `DROP\tTABLE`, `/**/DELETE/**/`). While Stage 2-3 AST checks are the real defense, a false sense of security from Stage 1 is worse than no check.

## Findings
- **Source:** Kieran Python Reviewer (P1 Fix Review)
- `sql_validator.py:25-28` — space-delimited check doesn't handle newlines, tabs, comments
- Stage 2 (`isinstance(parsed, sqlglot.exp.Select)`) catches non-SELECT at AST level
- Stage 1 is belt-and-suspenders but currently leaky

## Proposed Solutions

### Option A: Normalize whitespace before checking (Recommended)
```python
normalized = re.sub(r"\s+", " ", sql.upper()).strip()
tokens = set(normalized.split())
blocked_found = BLOCKED_KEYWORDS & tokens
```
- **Effort:** Small
- **Risk:** None

### Option B: Remove Stage 1 entirely
Rely on AST-level `isinstance(parsed, sqlglot.exp.Select)` check only.
- **Effort:** Trivial
- **Risk:** Low — removes one layer of defense but the remaining layers are stronger

## Acceptance Criteria
- [ ] `DELETE\nFROM table` is blocked by Stage 1
- [ ] `DROP\tTABLE foo` is blocked by Stage 1
- [ ] OR Stage 1 is removed with documented rationale

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | Pre-existing issue, not introduced by P1 fix |
