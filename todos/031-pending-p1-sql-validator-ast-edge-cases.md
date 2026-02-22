---
status: complete
priority: p1
issue_id: "031"
tags: [code-review, security, sql-injection, p1-fix-review]
dependencies: ["002"]
---

# SQL Validator AST Edge Cases May Miss Table References

## Problem Statement
The P1 fix for Finding 002 replaced substring matching with sqlglot AST exact match. While fundamentally stronger, edge cases exist where sqlglot may not emit `Table` nodes for all table references (e.g., table-valued functions, scalar subqueries inside function arguments). The BigQuery dry-run (Stage 4) and IAM permissions serve as backstops, but the AST check itself may provide false confidence.

## Findings
- **Source:** Security Sentinel (P1 Fix Review)
- `sql_validator.py` walks `parsed.find_all(sqlglot.exp.Table)` which may miss table refs in certain sqlglot parse modes
- Subqueries inside function arguments like `UNNEST(JSON_EXTRACT_ARRAY((SELECT col FROM other.dataset.t)))` may or may not emit Table nodes depending on sqlglot version
- BigQuery IAM (Stage 4 dry-run) is the real enforcement layer, but if the BQ service account has project-wide `bigquery.dataViewer`, cross-dataset access is possible

## Proposed Solutions

### Option A: Add table-count assertion + validate all subquery types (Recommended)
After the AST walk, verify that every table expression was validated. Also walk `sqlglot.exp.Subquery` nodes.
- **Effort:** Small
- **Risk:** Low

### Option B: Restrict BQ service account IAM to per-user datasets
Ensure the BigQuery service account used by the app has dataset-level (not project-level) permissions.
- **Effort:** Medium (infrastructure change)
- **Risk:** Low

### Option C: Both A and B (defense in depth)
- **Effort:** Medium
- **Risk:** None

## Acceptance Criteria
- [ ] All `sqlglot.exp.Table` nodes in any subquery depth are validated
- [ ] Query with no table references is rejected
- [ ] BigQuery service account IAM reviewed for least-privilege

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | AST validation is better than substring but needs edge-case hardening |
