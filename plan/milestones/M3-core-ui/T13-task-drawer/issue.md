# T13: Task drawer

**Milestone:** M3 Core UI
**Status:** Done

## Goal
Detail panel that pushes the board on wide screens.

## Requirements
- 520px Sheet; push layout at xl, overlay below
- Header with breadcrumb, id, save indicator, menu, close
- Inline title with 500 counter; properties grid; description; subtasks; activity
- Debounced autosave, validation, read-only banner
- Esc and overlay close, focus trap, focus returns to card

## Acceptance criteria
- [x] Read-only for users without edit rights

## Commit plan
- [x] `feat(task): drawer shell and focus behaviour (T13)`
- [x] `feat(task): properties grid and inline title (T13)`
- [x] `feat(task): description, subtasks and activity (T13)`
- [x] `feat(task): autosave and read-only mode (T13)`

## Tested
- [x] `npm run typecheck` / `test` / `build`
- [x] `store.test.ts` — updateTask title/priority/status
- [x] Manual: open from card/row; Esc/close returns focus; xl push vs overlay; title autosave; read-only banner when `!canEdit`

## AI notes
Activity feed is derived from created/updated timestamps (no activity model yet).
