---
status: complete
priority: p1
issue_id: "007"
tags: [code-review, resource-management, grpc]
dependencies: []
---

# Firestore AsyncClient Not Closed on Shutdown

## Problem Statement
The Firestore AsyncClient is created in the lifespan but never closed, leaking gRPC channels on shutdown.

## Findings
- **Source:** Python Reviewer
- **File:** `talk2mydata/backend/app/main.py`, lines 14-20
- BigQuery client is closed but Firestore is missing
- gRPC channel leak affects deployments and test scenarios

## Proposed Solutions

### Option A: Add close call in lifespan (Recommended)
```python
yield
app.state.bq_client.close()
await app.state.firestore_client.close()  # ADD THIS
```
- **Effort:** Small (one line)
- **Risk:** None

## Acceptance Criteria
- [ ] `await app.state.firestore_client.close()` added after yield in lifespan

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | One-line fix |
