---
status: pending
priority: p2
issue_id: "058"
tags: [code-review, performance]
dependencies: []
---

# Redundant Google Sheets API Calls During Ingestion

## Problem Statement
The `connect_and_ingest` flow calls `open_by_key` 5+ times redundantly -- once in `test_connection`, once in `discover_datasets`, and once per sheet in `extract_data`. For a 3-sheet spreadsheet, this is 12 API calls where 5 are needed.

## Findings
- **Source:** Performance Oracle (OPT-1)
- **File:** `backend/app/connectors/adapters/google_sheets.py`
- `test_connection()` opens spreadsheet (1 call)
- `discover_datasets()` opens again + lists worksheets (2 calls)
- Each `extract_data()` opens again + reads (3 calls per sheet)
- Total: 12 API calls for 3-sheet import, where only ~5 are needed

## Proposed Solutions

### Option A: Cache spreadsheet object on connector instance (Recommended)
```python
async def _get_spreadsheet(self) -> gspread.Spreadsheet:
    if self._spreadsheet is not None:
        return self._spreadsheet
    client = await self._get_client()
    self._spreadsheet = await run_sync(client.open_by_key, self.spreadsheet_id)
    return self._spreadsheet
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Spreadsheet object cached on connector instance
- [ ] API calls reduced by ~60% during ingestion

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
