---
status: complete
priority: p1
issue_id: "043"
tags: [code-review, security, secrets]
dependencies: []
---

# CRITICAL: Gemini API Key in env.yaml Tracked in Git

## Problem Statement
The file `talk2mydata/backend/env.yaml` is committed to git and contains a real Gemini API key (`AIzaSy...`). Additionally, `talk2mydata/frontend/.env.production` is tracked with the production Cloud Run URL and Google Client ID. Anyone with repo access can extract the API key and make unlimited Gemini API calls billed to the GCP project.

## Findings
- **Source:** Security Sentinel, Architecture Strategist
- **File:** `talk2mydata/backend/env.yaml` (line 3), `talk2mydata/frontend/.env.production`
- `env.yaml` contains `GEMINI_API_KEY: AIzaSyDcrvsZ2CUxfmyVIZzaUtuuy3u10M3fN7U`
- `.gitignore` excludes `.env` and `service-account-key.json` but NOT `env.yaml`
- `.env.production` was committed in commit `4afe0b7`

## Proposed Solutions

### Option A: Rotate key + purge from git history (Recommended)
1. Rotate the Gemini API key immediately via GCP Console
2. Add `env.yaml` and `*.env.production` to `.gitignore`
3. Remove from git tracking: `git rm --cached talk2mydata/backend/env.yaml talk2mydata/frontend/.env.production`
4. Use `git filter-repo` or BFG Repo Cleaner to purge from history
5. Move all secrets to GCP Secret Manager
- **Effort:** Medium
- **Risk:** Low (key rotation is safe)

### Option B: Rotate key + gitignore only
Skip history purge, just rotate and prevent future commits.
- **Effort:** Small
- **Risk:** Medium (key remains in git history)

## Recommended Action
Option A -- rotate immediately, purge history

## Technical Details
- **Affected files:** `backend/env.yaml`, `frontend/.env.production`, `.gitignore`
- **Components:** Secrets management, GCP billing

## Acceptance Criteria
- [ ] Gemini API key rotated in GCP Console
- [ ] `env.yaml` removed from git tracking and added to `.gitignore`
- [ ] `.env.production` removed from git tracking
- [ ] Git history purged of secret-containing files
- [ ] Pre-commit hook added to detect secrets (gitleaks or detect-secrets)

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | env.yaml was not in .gitignore unlike .env |
