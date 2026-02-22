---
status: complete
priority: p2
issue_id: "012"
tags: [code-review, performance, cost, ai]
dependencies: []
---

# Conversation History Unbounded (Cost Amplification)

## Problem Statement
While turns are limited to 10, each turn's content has no size limit. After 10 turns, history could be hundreds of KB, inflating Gemini API costs. Retry loop also appends validation errors to history.

## Findings
- **Source:** Security Sentinel
- **File:** `backend/app/query/service.py`, lines 157-175
- No per-turn content truncation
- Retry errors appended to persistent history

## Proposed Solutions

### Option A: Truncate turn content + separate retry context
- Cap individual turn content to 2000 chars
- Track total token count
- Use separate context for retry errors (not persistent history)
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] Individual turn content truncated to max length
- [ ] Retry errors not appended to persistent conversation history

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-21 | Created from code review | Cost control |
