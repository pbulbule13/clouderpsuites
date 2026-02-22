---
status: pending
priority: p2
issue_id: "017"
tags: [code-review, architecture, async]
dependencies: ["003"]
---

# Mixed Sync/Async Boundaries Unclear

## Problem Statement
DatasetService mixes synchronous methods (BigQuery calls) and async methods (Firestore calls) with no naming convention to distinguish them, making it error-prone.

## Findings
- **Source:** Python Reviewer
- **File:** `backend/app/datasets/service.py`
- Sync: `ensure_user_dataset`, `load_dataframe`
- Async: `register_dataset`, `get_user_datasets`, `get_dataset_schema`, `delete_dataset`
- No naming convention or documentation distinguishing them

## Proposed Solutions

### Option A: Make all methods async with run_in_executor (Recommended)
Wrap sync BigQuery calls, making the entire service consistently async.
- **Effort:** Medium (overlaps with finding 003)
- **Risk:** Low

## Acceptance Criteria
- [ ] All DatasetService methods are async
- [ ] Clear boundary between sync I/O and async interface

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Overlaps with sync blocking fix |
