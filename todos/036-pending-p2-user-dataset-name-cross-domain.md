---
status: complete
priority: p2
issue_id: "036"
tags: [code-review, architecture, hexagonal, p1-fix-review]
dependencies: ["008"]
---

# user_dataset_name() Cross-Domain Coupling

## Problem Statement
`QueryService` imports `DatasetService.user_dataset_name()` as a static method, creating a compile-time dependency from the `query` module to the `datasets` module. This violates hexagonal architecture boundaries and causes `query` to transitively pull in `pandas`, `bigquery`, and `schema_inference` — none of which it needs for this call.

## Findings
- **Source:** Architecture Strategist (P1 Fix Review)
- `query/service.py:61` — `user_dataset = DatasetService.user_dataset_name(user_id)`
- The function is a pure computation (hash user_id -> dataset name) with no I/O
- Used by both `DatasetService` and `QueryService` — shared infrastructure, not domain logic
- Transitive import chain: query -> datasets -> schema_inference, pandas, bigquery

## Proposed Solutions

### Option A: Extract to common/naming.py (Recommended)
```python
# common/naming.py
import hashlib
from app.config import settings

def user_dataset_name(user_id: str) -> str:
    return f"{settings.BQ_DATASET_PREFIX}{hashlib.sha256(user_id.encode()).hexdigest()[:20]}"
```
Both services import from `common/naming` instead of cross-domain.
- **Effort:** Small
- **Risk:** None

### Option B: Call via injected instance
```python
user_dataset = self.dataset_service.user_dataset_name(user_id)
```
Less clean but explicit through DI.
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria
- [ ] No direct import from `datasets` module in `query` module for naming
- [ ] Both services produce identical dataset names for the same user_id

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | Pure functions shared across domains belong in common/ |
