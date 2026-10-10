# T15: Feedback, Dev menu, optimistic rollback

**Milestone:** M4 Flows and feedback
**Status:** Todo

## Goal
Failures are visible and recoverable.

## Requirements
- Toasts: success, error with Retry, permission denied (amber + lock)
- Dev menu: latency, failure rate, Fail next mutation
- Optimistic drag and status change with snapshot rollback + shake

## Acceptance criteria
- [ ] Fail next + drag rolls back and offers Retry

## Commit plan
- [ ] `feat(feedback): toast variants (T15)`
- [ ] `feat(controller): dev menu for latency and failures (T15)`
- [ ] `feat(controller): optimistic updates with rollback (T15)`

## AI notes
_What Cursor got right, what I corrected or rejected._
