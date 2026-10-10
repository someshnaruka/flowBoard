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

### T10–T13
_Not done yet — fill when completing each issue._

---

## M4 / M5

_Fill when completing each issue._

---

## Template for new issues

```md
### TXX Title
- [ ] npm run typecheck / test / build
- [ ] Automated: <test file(s) + what they cover>
- [ ] Manual: <acceptance criteria checks>
```
