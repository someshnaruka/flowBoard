# T11: Drag and drop

**Milestone:** M3 Core UI
**Status:** Done

## Goal
Status and position persist on drop.

## Requirements
- dnd-kit sortable within and across columns
- DragOverlay, origin placeholder, highlighted drop column, insertion line
- Compute fractional position, call store actions
- Keyboard sensor; mark transforms // DND-STYLE-EXCEPTION

## Acceptance criteria
- [x] Dropping updates status and order; failures toast

## Commit plan
- [x] `feat(board): sortable context and overlay (T11)`
- [x] `feat(board): persist status and position on drop (T11)`

## Tested
- [x] `npm run typecheck` / `test` / `build`
- [x] Store: placeTask success + Bob FORBIDDEN
- [x] Manual: drag within/across columns; overlay; drop highlight; failNext toast

## AI notes
_What Cursor got right, what I corrected or rejected._
