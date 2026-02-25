---
status: pending
priority: p2
issue_id: "052"
tags: [code-review, quality, frontend]
dependencies: []
---

# Unsafe JSON.parse in SSE Stream + Missing Non-Null Check

## Problem Statement
The chat page's SSE stream parsing calls `JSON.parse(line.slice(6))` without try-catch and uses `response.body!` non-null assertion. Malformed SSE data kills the entire stream, and a null response body crashes at runtime.

## Findings
- **Source:** TypeScript Reviewer (C4, C5)
- **File:** `frontend/app/(app)/chat/[datasetId]/page.tsx`, lines 57, 71
- `response.body!.getReader()` -- non-null assertion crashes if body is null
- `JSON.parse(line.slice(6))` -- no try-catch, malformed data kills stream
- No SSEEvent discriminated union type defined

## Proposed Solutions

### Option A: Add guards and type definitions (Recommended)
1. Check `response.body` before `.getReader()`
2. Wrap `JSON.parse` in try-catch, skip malformed events
3. Define `SSEEvent` discriminated union type
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria
- [ ] `response.body` null check before getReader
- [ ] `JSON.parse` wrapped in try-catch with continue on failure
- [ ] `SSEEvent` type defined as discriminated union

## Work Log
| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-25 | Created from code review round 2 | |
