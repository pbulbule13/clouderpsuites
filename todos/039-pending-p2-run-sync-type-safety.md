---
status: complete
priority: p2
issue_id: "039"
tags: [code-review, quality, type-safety, p1-fix-review]
dependencies: ["003"]
---

# run_sync Lacks ParamSpec Type Safety

## Problem Statement
The `run_sync()` helper uses `Callable[..., T]` with untyped `*args, **kwargs`, meaning mypy/pyright cannot catch type errors at any call site. Since this function is used throughout the entire backend, this is a significant type safety gap.

## Findings
- **Source:** Kieran Python Reviewer (P1 Fix Review)
- `common/async_utils.py` — `*args` and `**kwargs` have no type annotations
- All BigQuery, gspread, and auth calls go through this function
- `ParamSpec` (Python 3.10+) can preserve callable parameter types

## Proposed Solutions

### Option A: Use ParamSpec (Recommended)
```python
from typing import ParamSpec, TypeVar
P = ParamSpec("P")
T = TypeVar("T")

async def run_sync(func: Callable[P, T], *args: P.args, **kwargs: P.kwargs) -> T:
    return await asyncio.to_thread(func, *args, **kwargs)
```
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria
- [ ] `run_sync` uses `ParamSpec` for full type inference at call sites
- [ ] mypy/pyright can catch argument type errors in `run_sync` calls

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | ParamSpec is the idiomatic way to type wrapper functions |
