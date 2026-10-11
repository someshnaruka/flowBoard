# Flowboard checklist

Master tracker for milestones and issues. Tick boxes here when an issue’s `issue.md` is marked **Done**. Keep in sync with `plan/milestones/**/issue.md`.

**Progress narrative / flows:** see [PROGRESS.md](./PROGRESS.md).

## Summary

| Milestone | Status | Issues done |
|---|---|---|
| M1 Foundation | Done | 4 / 4 |
| M2 Domain logic | Done | 4 / 4 |
| M3 Core UI | Done | 6 / 6 |
| M4 Flows and feedback | Done | 2 / 2 |
| M5 Polish and delivery | In progress | 2 / 6 |

**Overall:** 18 / 22 issues

---

## M1 — Foundation

- [x] **T00** Scaffold and tooling
- [x] **T01** Tailwind theme and shadcn/ui
- [x] **T02** Types, errors, ids and positions
- [x] **T03** Seed fixtures

Milestone: [x] Done

## M2 — Domain logic

- [x] **T04** Permission service
- [x] **T05** Hierarchy service
- [x] **T06** Task and status services
- [x] **T07** Store, selectors, simulated network

Milestone: [x] Done

## M3 — Core UI

- [x] **T08** App shell, sidebar tree, user switcher
- [x] **T09** Shared UI primitives
- [x] **T10** Kanban board (static)
- [x] **T11** Drag and drop
- [x] **T12** List view
- [x] **T13** Task drawer

Milestone: [x] Done

## M4 — Flows and feedback

- [x] **T14** CRUD flows and tree management
- [x] **T15** Feedback, Dev menu, optimistic rollback

Milestone: [x] Done

## M5 — Polish and delivery

- [x] **T16** Card interactions
- [x] **T17** Client-side search
- [ ] **T18** Spacing and density audit
- [ ] **T19** Component and E2E tests
- [ ] **T20** README and AI usage
- [ ] **T21** Demo video and submission

Milestone: [ ] Done

---

## How to update

1. Finish an issue → set `Status: Done` and tick boxes in its `issue.md`.
2. Tick the matching box here and bump the summary counts.
3. Append a short note to [PROGRESS.md](./PROGRESS.md) (what shipped + any flow change).
4. Prefer committing checklist + progress with the last commit of that issue (or a small `docs:` follow-up).
