# T09: Shared UI primitives

**Milestone:** M3 Core UI
**Status:** Done

## Goal
Reusable pieces so views stay consistent.

## Requirements
- StatusBadge, PriorityBadge, AvatarStack, DueDate, EmptyState, ConfirmDialog, SaveIndicator
- Colours come from theme tokens only

## Acceptance criteria
- [x] Quick component test for PriorityBadge/DueDate

## Commit plan
- [x] `feat(ui): status and priority badges (T09)`
- [x] `feat(ui): avatar stack, due date and empty state (T09)`
- [x] `feat(ui): confirm dialog and save indicator (T09)`

## Tested
- [x] `npm run typecheck` / `test` / `build`
- [x] `status-badge.test.tsx` — StatusBadge + PriorityBadge variants/tokens
- [x] `due-date.test.tsx` — overdue + empty state
- [x] ConfirmDialog / SaveIndicator / AvatarStack / EmptyState typecheck clean  
See also `plan/TESTED.md`.

## AI notes
_Variant props via cva; colors from Tailwind status/priority tokens only._
