# T19: Component and E2E tests

**Milestone:** M5 Polish and delivery
**Status:** Done

## Goal
Cover user flows, not just units.

## Requirements
- Component tests: TaskCard, Drawer Escape, EmptyState
- Playwright: Alice -> Bob hides Leadership -> open list -> change status -> toast

## Acceptance criteria
- [x] All tests pass from a fresh state

## Commit plan
- [x] `test(view): component tests (T19)`
- [x] `test(e2e): permission flow (T19)`

## AI notes
- Vitest: TaskCard, EmptyState, Drawer Escape (+ matchMedia mock in setup).
- Playwright chromium E2E: Alice→Bob hides Leadership, open Backlog task, status change toast.
- Status change toast added on drawer status updates for the E2E toast assertion / Figma feedback.
_What Cursor got right, what I corrected or rejected._
