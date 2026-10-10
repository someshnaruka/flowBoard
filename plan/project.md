# Flowboard: project plan

## Goal
Hierarchy (workspace > space > folder > list), tasks with kanban and list views, permission model with user switcher, strong UX, tests, README.

## Stack
Vite, React 18, TypeScript, Tailwind 3.4, shadcn/ui, Zustand + Immer, dnd-kit, lucide-react, Vitest, Playwright.

## Architecture
MVC: `model/` pure services and types, `controller/` Zustand store, `view/` React components. See `.cursor/rules/flowboard.mdc`.

## Milestones
| ID | Milestone | Day |
|---|---|---|
| M1 | Foundation | Sat |
| M2 | Domain logic | Sat |
| M3 | Core UI | Sun |
| M4 | Flows and feedback | Sun |
| M5 | Polish and delivery | Mon |

Each milestone folder has a `milestone.md` and one folder per task containing an `issue.md`.

## Working agreement
1. Pick the next unchecked issue.
2. Implement it in small steps following its Commit plan. One commit per step.
3. Tick the acceptance criteria, set Status to Done, commit the issue file with the last code commit.
4. Never commit multiple issues in one commit. Commit messages end with the issue id, for example `feat(model): add tree filtering (T04)`.
5. Record AI corrections in AI_USAGE.md as you go.

## Stretch goals chosen
Optimistic UI with rollback (T15), client-side search (T17), dark mode (T01), keyboard shortcuts cheatsheet (T16).

## Cut list (if behind)
Density toggle, tree drag reorder.
