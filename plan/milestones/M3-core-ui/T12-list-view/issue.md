# T12: List view

**Milestone:** M3 Core UI
**Status:** Done

## Goal
Dense table with sorting and offset pagination.

## Requirements
- Sticky header, 36px rows: status, title, assignees, priority, due date
- Status and priority rendered as `StatusBadge` / `PriorityBadge`
- Sort by due date and priority
- Simulated offset pagination over in-memory data (page size 10 + Load more)
- Row click opens drawer; new tasks appear and scroll into view

## Acceptance criteria
- [x] Sort works both directions; Load more pages in-memory tasks

## Commit plan
- [x] `feat(list): table layout (T12)`
- [x] `feat(list): sorting (T12)`
- [x] `feat(list): load-more pagination (T12)`
- [x] `fix(list): badge chips; drop react-window for pagination (T12)`

## Tested
- [x] `npm run typecheck` / `test` / `build`
- [x] `list-sort.test.ts` — priority desc, due asc + nulls last, both directions
- [x] `list-pagination.test.ts` — offset slice / load-more window
- [x] Manual: Board|List toggle; sort headers; + Task appears in list; status/priority badges

## AI notes
Offset pagination (Load more) over in-memory tasks — no virtualization library.

