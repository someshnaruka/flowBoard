# T10: Kanban board (static)

**Milestone:** M3 Core UI
**Status:** Done

## Goal
Scannable board with loading and empty states.

## Requirements
- KanbanBoard, Column (288px, sticky header, count, collapse), TaskCard (title clamp, priority, due, avatars, subtask count)
- View bar with Board|List toggle and + Task
- Skeleton on list switch, empty column state

## Acceptance criteria
- [x] Board renders per-list statuses, permission-filtered

## Commit plan
- [x] `feat(board): columns and header (T10)`
- [x] `feat(board): task card (T10)`
- [x] `feat(board): loading and empty states (T10)`

## Tested
- [x] `npm run typecheck` / `test` / `build`
- [x] Manual: columns per list status; Board|List toggle; + Task creates; skeleton on list switch; empty column; collapse

## AI notes
_What Cursor got right, what I corrected or rejected._
