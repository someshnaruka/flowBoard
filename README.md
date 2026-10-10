# Flowboard

Mini project-management app (ClickUp / Asana / Linear style) for a frontend take-home.

## Stack

Vite, React 18, TypeScript, Tailwind 3.4, shadcn/ui, Zustand + Immer, dnd-kit, Vitest, Playwright.

## Architecture

MVC under `src/`:

- `model/` — pure types and services (no React)
- `controller/` — Zustand store and orchestration
- `view/` — React components

See `.cursor/rules/` and `plan/project.md` for full rules and the milestone plan.

- Checklist (milestones / issues): [`plan/CHECKLIST.md`](plan/CHECKLIST.md)
- Progress & flows: [`plan/PROGRESS.md`](plan/PROGRESS.md)
- What was tested per issue: [`plan/TESTED.md`](plan/TESTED.md)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run typecheck` | TypeScript project references check |
| `npm run test` | Run Vitest |
| `npm run lint` | Run ESLint |

## Getting started

```bash
npm install
npm run dev
```
