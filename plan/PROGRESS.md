# Flowboard progress log

Living notes on what is built, how data and permissions flow, and what comes next. Update after each milestone (or major issue).

Companion checklist: [CHECKLIST.md](./CHECKLIST.md).

---

## Current status

**As of:** 2026-10-12

- **Done:** M1–M5 complete (T00–T21). App submitted with live demo and video.
- **Tests:** Vitest 74 green; Playwright permission E2E (`e2e/permission-flow.spec.ts`)
- **Repo:** https://github.com/someshnaruka/flowBoard
- **Live:** https://flow-board-one-pied.vercel.app/
- **Demo video:** https://www.loom.com/share/220990e5a32f4da586878aaf6e2600a9
- **Docs:** README + `AI_USAGE.md`
- **Network sim:** Dev menu → Fail next mutation (`failNext`) only

---

## Architecture (MVC)

```
src/
  model/         # Pure TS — types, seed, services (no React)
  controller/    # Zustand store, selectors, simulateNetwork
  view/          # React UI
```

**Rules that matter for every flow**

1. `model/` never imports `controller/` or `view/`.
2. Services are pure: `(state, actor, input) => Result<T>` — no throws, no mutation of inputs.
3. `view/` never calls `model/services` directly — only store actions + selectors.
4. Mutations go through the controller pipeline (below).

---

## Core flows

### 1. Permission / visibility

```
User requests node
        │
        ▼
   Admin? ──yes──► visible / editable
        │ no
        ▼
 Nearest grant on node or ancestors?
   ├── allow  → visible
   ├── deny   → hidden
   └── none   → if any private ancestor → hidden, else visible
```

**Shell ancestors:** if a deep node is allowed but a private ancestor is not, `filterTree` still includes those ancestors as `isShell: true` so the sidebar can navigate to the allowed leaf.

**Seed demo (Alice / Bob / Carol)**

| Area | Alice | Bob | Carol |
|---|---|---|---|
| Engineering (public) | ✅ | ✅ | ✅ |
| Backlog | ✅ | ✅ | ❌ deny |
| Sprint | ✅ | ❌ deny | ✅ |
| Leadership (private) | ✅ | ❌ deny | ✅ allow |
| OKRs | ✅ | ❌ | ✅ |

Implementation: `src/model/services/permission.service.ts`  
Seed matrix comment: `src/model/seed.ts`

### 2. Mutation pipeline (controller)

```
UI / test calls store action (e.g. createTask)
        │
        ▼
 assertCan(state, currentUser, nodeId, 'edit'|'view')
        │ FORBIDDEN / NOT_FOUND → return Result.error (no apply)
        ▼
 model service (createTask, archiveNode, …)
        │ VALIDATION / … → return Result.error
        ▼
 simulateNetwork({ failNext })
        │ NETWORK_ERROR → clear failNext, do not apply
        ▼
 immer apply domain snapshot to store
        │
        ▼
 return Result.data
```

Optimistic paths (`placeTask`, status `updateTask`) apply before `simulateNetwork`, then roll back the domain snapshot on `NETWORK_ERROR`.

Implementation: `src/controller/store.ts`, `src/controller/simulateNetwork.ts`

### 3. User switch

```
switchUser(userId)
  → currentUserId = userId
  → if selectedListId not canView → pick first visible list (or null)
  → if drawer task’s list not canView → close drawer
```

Selectors (`selectVisibleTree`, `selectTasksForList`, …) always use `currentUserId`.

### 4. Hierarchy & tasks (model)

- **Parents:** workspace ← space ← folder ← list (nothing under lists).
- **Archive:** soft-delete cascades to descendants; restore requires a live parent and restores the same `archivedAt` stamp.
- **Positions:** fractional `between` / `after` / `before` (+ `rebalance` when gaps collapse).
- **Move task across lists:** remap status by **category**, else first `todo` on the target list.

---

## What each completed milestone delivered

### M1 — Foundation

| Issue | Outcome |
|---|---|
| T00 | Vite + React 18 + TS, ESLint/Prettier/Vitest, Husky pre-push build |
| T01 | Tailwind 3.4 tokens, shadcn in `src/view/ui`, Light/Dark/System theme |
| T02 | Domain types, `Result`/`ErrorCode`, `newId`, position helpers + tests |
| T03 | `createSeed()` — Acme tree, tasks, grants matrix |

### M2 — Domain logic

| Issue | Outcome |
|---|---|
| T04 | Permission service + tree filter/shells + tests |
| T05 | Hierarchy CRUD / move / reorder / archive-restore + tests |
| T06 | Task + status services (incl. list move remap) + tests |
| T07 | Zustand+Immer store, selectors, network sim, gated mutations + tests |

### M3 — Core UI

| Issue | Outcome |
|---|---|
| T08 | App shell, sidebar tree, user switcher |
| T09 | Shared UI primitives |
| T10 | Kanban board |
| T11 | Board DnD (dnd-kit) |
| T12 | List view + sort + offset pagination |
| T13 | Task drawer |

### M4 — Flows and feedback

| Issue | Outcome |
|---|---|
| T14 | Remaining CRUD through store pipeline; tree management |
| T15 | Toasts, Dev menu (`failNext`), optimistic rollback |

### M5 — Polish and delivery

| Issue | Outcome |
|---|---|
| T16 | Card interactions, shortcuts |
| T17 | Client-side search |
| T18 | Spacing / density audit |
| T19 | Component + E2E tests |
| T20 | README and AI usage |
| T21 | Demo video + submission — Loom link in README |

---

## What’s next

Optional: tag v1.0 for a named release. Delivery criteria for T21 are otherwise complete.

---

## Changelog (append-only)

### 2026-10-12 — T21 demo video

- README Demo video points at the Loom walkthrough.
- Checklist / progress: M5 6 / 6, all milestones Done.

### 2026-10-12 — Submission cleanup

- Removed Vite scaffold assets; `.gitignore` covers `.env*`.
- Network sim is `failNext` only.
- Plan status: feature complete.

### 2026-10-11 — T18 consistency audit

- TopBar: workspace breadcrumbs + search + Dev/User.
- ViewBar: list title + Board/List + Filter + Task; solid active toggle.
- Pass 2: brand/status/priority colors; dark mode lift + badge surfaces; board skeleton; column Add task; search empty + `/`/`esc` hints; list selected/done.

### 2026-10-11 — T17 client-side search

- Debounced (200ms) title/description filter via `searchQuery` + `selectTasksForListQuery`.
- Title highlight on cards/rows; empty-match state with Clear search on board and list.
- Search clears when switching lists; `/` focuses the view-bar input.

### 2026-10-11 — T16 card interactions

- Card/list hover menu: open, duplicate, archive (undo), delete.
- Inline priority / assignee / due popovers (edit-gated).
- Global shortcuts + `?` cheatsheet; `/` focuses search; `C` creates task.
- Soft `archiveTask` / `restoreTask` in model + store.

### 2026-10-11 — T15 feedback / Dev menu / optimistic rollback

- Toast helpers: success, error+Retry, forbidden (amber + lock).
- Top-bar Dev menu: Fail next mutation (`failNext`).
- `placeTask` / status `updateTask` apply optimistically; network fail restores snapshot, sets `shakeTaskId`, board offers Retry.

### 2026-10-10 — T09 UI primitives

- Variant-based `StatusBadge` / `PriorityBadge` (theme tokens only).
- `AvatarStack`, `DueDate`, `EmptyState`, `ConfirmDialog`, `SaveIndicator`.
- Component tests for badges + due date.

### 2026-10-10 — T08 app shell

- `AppShell` + collapsible sidebar (260↔56) + top bar.
- `SidebarTree` from `selectVisibleTree` — Alice/Bob/Carol switch changes the tree.
- `UserSwitcher` with role badges, theme menu, “Viewing as” toast.

### 2026-10-10 — M1 + M2 complete

- Pushed foundation + domain logic to `main`.
- Added this progress log and the master [CHECKLIST.md](./CHECKLIST.md).

<!-- Append new dated sections below as milestones ship. -->
