---
status: pending
priority: p3
issue_id: "023"
tags: [code-review, architecture, yagni]
dependencies: []
---

# Connector Over-Engineering for Single Adapter

## Problem Statement
ABC `DataConnector` + `ConnectorRegistry` with decorator-based registration exists to support exactly one connector: `GoogleSheetsConnector`. ~70 LOC of abstraction for a single implementation.

## Findings
- **Source:** Code Simplicity Reviewer
- **Files:** `backend/app/connectors/ports.py`, `registry.py`, `adapters/`
- `list_available()` never called
- Registry indirection serves no current purpose

## Proposed Solutions
Inline Google Sheets logic directly. Extract abstraction when second connector arrives.
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria
- [ ] Decision made: keep abstraction or inline
- [ ] If inlined, ~70 LOC saved

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | YAGNI consideration |
