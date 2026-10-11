# Flowboard progress log

Living notes on what is built, how data and permissions flow, and what comes next. Update after each milestone (or major issue).

Companion checklist: [CHECKLIST.md](./CHECKLIST.md).

---

## Current status

**As of:** 2026-10-11 (T16 done)

- **Done:** M1–M4 + **T16** on `feat/Flowboard`
- **Next:** **T17** client-side search
- **Tests:** Vitest green (`npm run test`)
- **Repo:** https://github.com/someshnaruka/flowBoard
- **Branch:** `feat/Flowboard`
- **T16:** card hover menu, inline field popovers, global shortcuts + cheatsheet, task soft-archive

---

## Architecture (MVC)

```
src/
  model/         # Pure TS — types, seed, services (no React)
  controller/    # Zustand store, selectors, simulateNetwork
  view/          # React UI (theme + shadcn so far; shell comes in M3)
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
 simulateNetwork({ latencyMs, failureRate, failNext })
        │ NETWORK_ERROR → clear failNext, do not apply
        ▼
 immer apply domain snapshot to store
        │
        ▼
 return Result.data
```

Today the store exposes the full pipeline for **`createTask`**. Remaining CRUD actions are wired in M4 (T14) on top of the same pattern.

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
| T03 | `createSeed()` — Acme tree, 19 tasks, grants matrix |

### M2 — Domain logic

| Issue | Outcome |
|---|---|
| T04 | Permission service + tree filter/shells + tests |
| T05 | Hierarchy CRUD / move / reorder / archive-restore + tests |
| T06 | Task + status services (incl. list move remap) + tests |
| T07 | Zustand+Immer store, selectors, network sim, gated `createTask` + tests |

---

## What’s next (M3+)

```
T08  App shell + sidebar tree + user switcher
T09  Shared primitives (StatusBadge, ConfirmDialog, …)
T10  Static kanban
T11  DnD (dnd-kit)
T12  List view
T13  Task drawer
   ↓
T14  Wire remaining CRUD through the store pipeline
T15  Toasts, Dev menu, optimistic UI + rollback
   ↓
T16–T21  Polish, search, tests, docs, demo
```

UI should read Figma as the visual source of truth:  
https://www.figma.com/design/0D1riu0d45cFBhWbRUUTjd/Flowboard-UI-Design

---

## Changelog (append-only)

### 2026-10-11 — T16 card interactions

- Card/list hover menu: open, duplicate, archive (undo), delete.
- Inline priority / assignee / due popovers (edit-gated).
- Global shortcuts + `?` cheatsheet; `/` focuses search; `C` creates task.
- Soft `archiveTask` / `restoreTask` in model + store.

### 2026-10-11 — T15 feedback / Dev menu / optimistic rollback

- Toast helpers: success, error+Retry, forbidden (amber + lock).
- Top-bar Dev menu: latency, failure rate, fail-next mutation.
- `placeTask` / status `updateTask` apply optimistically; network fail restores snapshot, sets `shakeTaskId`, board offers Retry.

### 2026-10-10 — T09 UI primitives

- Variant-based `StatusBadge` / `PriorityBadge` (theme tokens only).
- `AvatarStack`, `DueDate`, `EmptyState`, `ConfirmDialog`, `SaveIndicator`.
- Component tests for badges + due date.

### 2026-10-10 — T08 app shell

- `AppShell` + collapsible sidebar (260↔56) + top bar.
- `SidebarTree` from `selectVisibleTree` — Alice/Bob/Carol switch changes the tree.
- `UserSwitcher` with role badges, theme menu, “Viewing as” toast.
- Main pane still a placeholder until T10 kanban.

### 2026-10-10 — M1 + M2 complete

- Pushed foundation + domain logic to `main`.
- Added this progress log and the master [CHECKLIST.md](./CHECKLIST.md).
- App is still a theme/smoke UI; domain is ready for the M3 shell to consume `useFlowStore` / selectors.

<!-- Append new dated sections below as milestones ship. -->
