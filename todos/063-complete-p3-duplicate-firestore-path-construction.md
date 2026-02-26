---
status: complete
priority: p3
issue_id: "063"
tags: [code-review, quality, python]
dependencies: []
---

# Duplicate Firestore Path Construction (9 Occurrences)

## Problem Statement
`self.db.collection("users").document(user_id).collection(...)` is constructed 9 times across 3 files. If the Firestore collection structure changes, all must be updated manually.

## Findings
- **Source:** Pattern Recognition (2.3)
- **Files:** `datasets/service.py` (4x), `query/service.py` (4x), `auth/service.py` (1x)

## Proposed Solutions
Add helper methods: `_user_ref(user_id)`, `_datasets_ref(user_id)`, `_conversations_ref(user_id)`.
- **Effort:** Small

## Acceptance Criteria
- [ ] Firestore paths constructed via helper methods
- [ ] Collection names defined as constants

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
