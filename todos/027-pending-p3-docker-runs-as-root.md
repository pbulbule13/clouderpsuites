---
status: pending
priority: p3
issue_id: "027"
tags: [code-review, security, docker]
dependencies: []
---

# Docker Container Runs as Root

## Problem Statement
Backend Dockerfile has no USER directive, running as root. If compromised, attacker has root access within the container.

## Findings
- **Source:** Security Sentinel
- **File:** `backend/Dockerfile`
- No `adduser` or `USER` directive

## Proposed Solutions
Add non-root user:
```dockerfile
RUN adduser --disabled-password --gecos '' appuser
USER appuser
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Backend container runs as non-root user

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Container security |
