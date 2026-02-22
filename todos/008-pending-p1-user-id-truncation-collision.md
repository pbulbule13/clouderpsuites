---
status: complete
priority: p1
issue_id: "008"
tags: [code-review, security, data-isolation]
dependencies: []
---

# User ID Truncation Creates Dataset Collision Risk

## Problem Statement
Google `sub` values are typically 21 digits, but the code truncates to 20 characters. Users whose IDs share the first 20 characters map to the SAME BigQuery dataset, causing cross-user data contamination.

## Findings
- **Source:** Security Sentinel, Python Reviewer
- **File:** `talk2mydata/backend/app/datasets/service.py`, line 15
- **File:** `talk2mydata/backend/app/query/service.py`, line 60
- **Code:** `user_id[:20]`
- Two users could unknowingly share a BigQuery dataset

## Proposed Solutions

### Option A: Hash the user ID (Recommended)
```python
import hashlib
hashed = hashlib.sha256(user_id.encode()).hexdigest()[:20]
return f"{settings.BQ_DATASET_PREFIX}{hashed}"
```
- **Effort:** Small
- **Risk:** Low (requires migrating existing datasets)

### Option B: Use full user ID
Remove truncation entirely.
- **Effort:** Small
- **Risk:** Low (BigQuery dataset names allow up to 1024 chars)

## Acceptance Criteria
- [ ] No user ID truncation or collision-resistant hashing applied
- [ ] Uniqueness check when creating datasets

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Data isolation critical |
