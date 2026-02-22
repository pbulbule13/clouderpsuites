---
status: pending
priority: p2
issue_id: "041"
tags: [code-review, bug, quality, p1-fix-review]
dependencies: []
---

# QueryEvent.to_json Drops Data When Dict is Falsy

## Problem Statement
`QueryEvent.to_json()` uses `if self.data:` which is falsy for an empty dict `{}`. If any code path sets `data={}`, the data field is silently dropped from the JSON output. The correct check is `if self.data is not None:`.

## Findings
- **Source:** Kieran Python Reviewer (P1 Fix Review)
- `query/service.py:22-26` — `if self.data:` should be `if self.data is not None:`
- A query returning zero rows could produce a truthy dict, but edge cases with empty dicts would silently lose data
- Pre-existing bug, not introduced by P1 fixes

## Proposed Solutions

### Option A: Fix falsy check (Recommended)
```python
if self.data is not None:
    d["data"] = self.data
```
- **Effort:** Trivial (1 line)
- **Risk:** None

## Acceptance Criteria
- [ ] `QueryEvent(type="data", content="", data={}).to_json()` includes `"data": {}`
- [ ] `QueryEvent(type="data", content="", data=None).to_json()` omits `data` key

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | Always use `is not None` for optional dict/list checks |
