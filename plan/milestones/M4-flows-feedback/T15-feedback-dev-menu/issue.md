# T15: Feedback, Dev menu, optimistic rollback

**Milestone:** M4 Flows and feedback
**Status:** Done

## Goal
Failures are visible and recoverable.

## Requirements
- Toasts: success, error with Retry, permission denied (amber + lock)
- Dev menu: latency, failure rate, Fail next mutation
- Optimistic drag and status change with snapshot rollback + shake

## Acceptance criteria
- [x] Fail next + drag rolls back and offers Retry

## Commit plan
- [x] `feat(feedback): toast variants (T15)`
- [x] `feat(controller): dev menu for latency and failures (T15)`
- [x] `feat(controller): optimistic updates with rollback (T15)`

## AI notes
- Toast helpers in `view/feedback/toasts.tsx`; Dev menu in top bar; `placeTask` / status `updateTask` optimistic + shake on rollback.
_What Cursor got right, what I corrected or rejected._
