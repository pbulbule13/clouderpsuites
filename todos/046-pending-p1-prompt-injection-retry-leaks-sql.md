---
status: complete
priority: p1
issue_id: "046"
tags: [code-review, security, llm]
dependencies: []
---

# Prompt Injection: Retry Loop Leaks Failed SQL to LLM (Reopened from #004)

## Problem Statement
User questions are passed directly to Gemini without sanitization. When SQL validation fails, the failed SQL is appended to the retry history, giving attackers a feedback loop to refine prompt injection attacks across 3 retry attempts. Previous todo-004 was marked "complete" but the core issues remain.

## Findings
- **Source:** Security Sentinel (HIGH-01), Python Reviewer (C4)
- **File:** `backend/app/query/service.py`, lines 109-115; `backend/app/query/sql_generator.py`, line 105
- User's raw question is embedded directly: `contents.append({"role": "user", "parts": [{"text": question}]})`
- Failed SQL fed back into context: `retry_history.append({"role": "model", "content": sql_response.sql})`
- Attacker gets 3 attempts with feedback on what was rejected
- The `reasoning` field in responses could exfiltrate schema information

## Proposed Solutions

### Option A: Remove SQL from retry + add input sanitization (Recommended)
1. Do not include failed SQL in retry history -- use only generic correction prompt
2. Add basic input sanitization (strip SQL keywords from user questions)
3. Log all generated SQL for audit trail
- **Effort:** Small
- **Risk:** Low

### Option B: Dual-LLM architecture
Use a second LLM to review generated SQL for safety before validation.
- **Effort:** Large
- **Risk:** Low (but expensive)

## Recommended Action
Option A

## Technical Details
- **Affected files:** `backend/app/query/service.py`, `backend/app/query/sql_generator.py`
- **Components:** SQL generation, query pipeline

## Acceptance Criteria
- [ ] Failed SQL is NOT included in retry conversation history
- [ ] User input has basic sanitization before LLM prompt
- [ ] All generated SQL is logged for audit
- [ ] Retry uses only generic correction prompt

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Reopened from todo-004 | Error messages were genericized but SQL feedback loop remained |
