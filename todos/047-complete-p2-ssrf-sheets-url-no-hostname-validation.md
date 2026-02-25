---
status: complete
priority: p2
issue_id: "047"
tags: [code-review, security]
dependencies: []
---

# SSRF: Google Sheets URL Accepts Arbitrary Hostnames

## Problem Statement
The Google Sheets connector extracts spreadsheet IDs via regex but does not validate the URL hostname. Any URL containing `/spreadsheets/d/` passes. Authenticated users can also probe arbitrary spreadsheet IDs to enumerate sheets the service account has access to.

## Findings
- **Source:** Security Sentinel (HIGH-02)
- **File:** `backend/app/connectors/adapters/google_sheets.py`, lines 71-74
- Regex: `re.search(r"/spreadsheets/d/([a-zA-Z0-9-_]+)", url)` -- no host check
- `https://evil.com/spreadsheets/d/ABC` passes extraction
- Error messages leak internal details about service account permissions

## Proposed Solutions

### Option A: Validate hostname before extraction (Recommended)
```python
from urllib.parse import urlparse
parsed = urlparse(url)
if parsed.hostname not in ("docs.google.com", "sheets.google.com"):
    raise ConnectorError("URL must be a Google Sheets link")
```
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] URL hostname validated as `docs.google.com` or `sheets.google.com`
- [ ] Non-Google URLs rejected with generic error
- [ ] Rate limiting on discover/connect endpoints per user

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
