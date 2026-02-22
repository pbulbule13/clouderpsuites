---
status: complete
priority: p1
issue_id: "032"
tags: [code-review, performance, async, p1-fix-review]
dependencies: ["003"]
---

# gspread.authorize() Not Wrapped in run_sync

## Problem Statement
The async conversion (Finding 003 fix) wrapped all gspread API calls in `run_sync()`, but missed `gspread.authorize()` inside `_get_client()`. This method can trigger a synchronous HTTP token refresh, blocking the event loop on every new Sheets connector instance.

## Findings
- **Source:** Performance Oracle (P1 Fix Review)
- `google_sheets.py:38` — `gspread.authorize(creds)` is called from sync `_get_client()` which runs on the event loop thread
- `Credentials()` constructor is safe (no I/O), but `gspread.authorize()` may trigger token refresh via HTTP
- Under concurrent requests, multiple event loop stalls stack up
- All other gspread calls (open_by_key, worksheets, get_all_values, etc.) ARE correctly wrapped

## Proposed Solutions

### Option A: Convert _get_client to async with run_sync wrapper (Recommended)
```python
async def _get_client(self) -> gspread.Client:
    if self._client is None:
        def _init():
            creds = Credentials(...)
            return gspread.authorize(creds)
        self._client = await run_sync(_init)
    return self._client
```
Update all callers to `await self._get_client()`.
- **Effort:** Small
- **Risk:** Low — all callers are already async

## Acceptance Criteria
- [ ] `gspread.authorize()` runs in a thread pool, not on the event loop
- [ ] All callers of `_get_client()` use `await`
- [ ] No sync blocking I/O remains in the Google Sheets connector async call paths

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | Missed during initial async conversion pass |
