# T12: List view

**Milestone:** M3 Core UI
**Status:** Done

## Goal
Dense table with sorting and pagination.

## Requirements
- Sticky header, 36px rows: status, title, assignees, priority, due date
- Sort by due date and priority
- In-memory pagination with Load more
- Row click opens drawer

## Acceptance criteria
- [x] Sort works both directions; pagination footer shows counts

## Commit plan
- [x] `feat(list): table layout (T12)`
- [x] `feat(list): sorting (T12)`
- [x] `feat(list): load-more pagination (T12)`

## Tested
- [x] `npm run typecheck` / `test` / `build`
- [x] `list-sort.test.ts` — priority desc, due asc + nulls last, both directions
- [x] Manual: Board|List toggle; sort headers; Load more counts; row click sets drawerTaskId

## AI notes
_What Cursor got right, what I corrected or rejected._
