---
status: pending
priority: p2
issue_id: "035"
tags: [code-review, security, error-handling, p1-fix-review]
dependencies: ["001"]
---

# Auth Middleware Only Catches ValueError

## Problem Statement
`AuthMiddleware` only catches `ValueError` from `verify_oauth2_token()`. Network failures (`TransportError`, `ConnectionError`) propagate as unhandled 500 errors through `GlobalErrorMiddleware` instead of returning a clear auth failure response. This also leaks error fingerprints (500 vs 401) that attackers can use to detect infrastructure issues.

## Findings
- **Source:** Security Sentinel + Architecture Strategist (P1 Fix Review)
- `auth.py:32` — `except ValueError:` is the only exception handler
- `google.auth.exceptions.TransportError` can occur when Google certs endpoint is unreachable
- Due to Starlette `BaseHTTPMiddleware` exception propagation quirks, unhandled exceptions may bypass `GlobalErrorMiddleware`
- Consider returning 503 for infrastructure failures vs 401 for bad tokens

## Proposed Solutions

### Option A: Add broad exception handler (Recommended)
```python
except ValueError:
    return JSONResponse(status_code=401, content={"error": "Invalid token"})
except Exception:
    logger.warning("Token verification failed", exc_info=True)
    return JSONResponse(status_code=503, content={"error": "Authentication service unavailable"})
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Network failures during token verification return 503, not raw 500
- [ ] Invalid tokens return 401
- [ ] Auth errors are logged with details for debugging

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-22 | Created from P1 fix review | BaseHTTPMiddleware exception propagation makes this important |
