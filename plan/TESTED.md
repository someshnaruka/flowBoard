# Issue verification log

Record **what was tested** when each issue is marked Done.  
Update this file (and the `## Tested` section in that issue’s `issue.md`) on the **last commit** of the issue.

Commands used for almost every issue unless noted:

```bash
npm run typecheck
npm run test
npm run build   # also runs on husky pre-push
```

---

## M1 — Foundation

### T00 Scaffold and tooling
- [x] `npm run typecheck` / `build` / `dev` scripts exist and pass
- [x] `@/` alias resolves; MVC folders present

### T01 Tailwind theme and shadcn/ui
- [x] `typecheck` + `build`
- [x] Smoke UI: Button / Badge / toast; Light·Dark·System theme toggle
- [x] Theme persists via `flowboard.theme`

### T02 Types, errors, ids and positions
- [x] `position.test.ts` — after/before/between/rebalance (7 tests)
- [x] No React imports under `model/`

### T03 Seed fixtures
- [x] `seed.test.ts` — shape, counts, grants matrix, status↔list integrity
- [x] Mix of priorities, assignees, overdue dates

---

## M2 — Domain logic

### T04 Permission service
- [x] `permission.service.test.ts` — admin, public/private, allow/deny, nearest-wins, shells, Alice/Bob/Carol

### T05 Hierarchy service
- [x] `hierarchy.service.test.ts` — parents, create/rename, cycle, reorder, archive cascade + restore

### T06 Task and status services
- [x] `task.service.test.ts` — create/update/delete validation, subtask depth, status change, reorder, list move remap
- [x] Status add/rename; delete blocked when in use

### T07 Store, selectors, network
- [x] `store.test.ts` — Bob FORBIDDEN on Sprint; switchUser tree/selection/drawer; `failNext` → NETWORK_ERROR; happy-path createTask

---

## M3 — Core UI

### T08 App shell, sidebar tree, user switcher
- [x] `typecheck` / `test` / `build` / `lint`
- [x] Manual / UX checks (run `npm run dev`):
  - [x] Sidebar collapses 260 → 56 and expands back
  - [x] Tree rows render from `selectVisibleTree`
  - [x] Switch Alice → Bob → Carol changes visible nodes (Sprint/Leadership/Backlog per seed matrix)
  - [x] Selecting a list updates top bar title
  - [x] User switcher shows role badge + “Viewing as …” toast
  - [x] First-load tree skeletons appear briefly
- [x] **Bugfix:** blank screen from unstable Zustand selectors (`selectVisibleTree` / `Object.values(users)` new refs every render) — memoized domain slices instead

### T09 Shared UI primitives
- [x] `status-badge.test.tsx` — StatusBadge + PriorityBadge token classes
- [x] `due-date.test.tsx` — overdue tone + empty “No date”
- [x] `typecheck` / `test` / `build`
- [x] Primitives use theme tokens only (`status.*`, `priority.*`); variants via props

### T10 Kanban board (static)
- [x] `typecheck` / `test` / `build`
- [x] Manual / UX checks (run `npm run dev`):
  - [x] Board columns match list statuses (permission-filtered)
  - [x] Task cards show title clamp, priority, due, avatars, subtask count
  - [x] View bar Board|List toggle; + Task creates into first todo status
  - [x] Skeleton on list switch; empty column state; column collapse

### T11 Drag and drop
- [x] `typecheck` / `test` / `build`
- [x] `store.test.ts` — placeTask across status; Bob FORBIDDEN on Sprint
- [x] Manual / UX checks (run `npm run dev`):
  - [x] Drag within column reorders; across columns updates status
  - [x] DragOverlay, origin placeholder, drop-column highlight, insertion line
  - [x] Keyboard sensor; drop failure toasts when `failNext` is set

### T12 List view
- [x] `typecheck` / `test` / `build`
- [x] `list-sort.test.ts` — priority / due date both directions; nulls last
- [x] Manual / UX checks (run `npm run dev`):
  - [x] View bar List toggle shows sticky header + 36px rows
  - [x] Sort Priority and Due both directions
  - [x] Offset pagination (Load more); + Task appears in list (scrolls into view)
  - [x] Status and priority use badge chips
  - [x] Row click sets `drawerTaskId` (drawer UI in T13)

### T13 Task drawer
- [x] `typecheck` / `test` / `build`
- [x] `store.test.ts` — updateTask fields + status
- [x] Manual / UX checks (run `npm run dev`):
  - [x] Card/row click opens drawer; Esc / close returns focus to `data-task-id`
  - [x] `xl+` pushes board; narrower viewports use Sheet overlay
  - [x] Title/description debounced autosave; properties persist
  - [x] Read-only banner when `selectCanEditTask` is false

---

## M4 — Flows and feedback

### T14 CRUD flows and tree management
- [x] `typecheck` / `test` / `build`
- [x] `store.test.ts` — create list statuses; archive/restore; duplicate/delete
- [x] Manual: tree Add/Rename/Archive/Move; archive ConfirmDialog + Undo; drawer Duplicate/Delete
- [x] Manual: sidebar Archived section Restore

### T15 Feedback, Dev menu, optimistic rollback
- [x] `typecheck` / `test` / `build`
- [x] `store.test.ts` — `failNext` → NETWORK_ERROR; optimistic `placeTask` / status `updateTask` rollback + `shakeTaskId`
- [x] Manual: Dev menu → Fail next mutation; drag rolls back with toast + Retry

---

## M5 — Polish and delivery

### T16 Card interactions
- [x] `typecheck` / `test` / `build`
- [x] `TaskCard.test.tsx` — open handler / card chrome
- [x] `shortcut-bindings.test.ts` — cheatsheet binding list + typing-target helper
- [x] Manual: card menu (open / duplicate / archive / delete); inline field popovers; shortcuts

### T17 Client-side search
- [x] `typecheck` / `test` / `build`
- [x] `selectors.search.test.ts` — title/description match; `selectTasksForListQuery`
- [x] Manual: view-bar search filters board + list; empty-match Clear search; `/` focuses search

### T18 Spacing and density audit
- [x] `typecheck` / `test` / `build` / `lint`
- [x] Manual: shell heights, column width, row density vs design

### T19 Component and E2E tests
- [x] `typecheck` / `test` / `build`
- [x] Vitest (70): services, store, search, list sort/pagination, badges, due date, empty state, TaskCard, drawer escape, shortcuts
- [x] `e2e/permission-flow.spec.ts` — Alice → Bob hides Leadership; status change toast

### T20 README and AI usage
- [x] README + `AI_USAGE.md` present and kept in sync with code

### T21 Demo video and submission
- [x] Demo video URL in README (Loom)
- [ ] Tag v1.0 (optional release step)

---

## Template for new issues

```md
### TXX Title
- [ ] npm run typecheck / test / build
- [ ] Automated: <test file(s) + what they cover>
- [ ] Manual: <acceptance criteria checks>
```
