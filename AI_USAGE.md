# AI usage log

I used Cursor (Composer / agent) throughout this take-home. Below is what helped, what I corrected, and what I decided myself.

## What the AI helped with

- Scaffolding the MVC split (`model` / `controller` / `view`) and pure services that return `Result<T>`.
- Wiring dnd-kit (board + tree), the Zustand mutation pipeline, and permission selectors.
- Generating shadcn-style primitives under `src/view/ui` and iterating on density (shell heights, column width, badges).
- Drafting Vitest coverage for services/store and the Playwright Alice→Bob permission E2E.
- Fast UI polish passes (status/priority tokens, dark mode, dialogs, list Load more).

## What I corrected or rejected

| Topic | What I changed |
| --- | --- |
| Badge borders / hardcoded hex | Kept borderless badges on Tailwind status/priority tokens |
| Confirm on `AlertDialog` | Switched to `Dialog` so outside-click dismiss works |
| Drawer closing under confirm | Overlay uses `data-flowboard-modal-overlay` so TaskDrawer ignores those clicks |
| Status dots on badges | Removed from badges; column dots remain |
| List “infinite” scroll | Offset pagination (page size 10) + Load more |
| User switcher copy | Alice/Bob/Carol display names; role capitalized separately |
| Inline styles / virtualization | Only dnd-kit `style=` exceptions; dropped `react-window` |
| Lint `setState` in effects | Refactored BoardWorkspace, board DnD, ListView paging, SearchInput, DrawerPanel, RenameDialog, autosave; later remounted GrantsDialog form instead of effects |
| Status `color` | Required hex field mapped to Tailwind tokens for dots/badges |
| Network simulation | Cut latency / failure-rate controls; Dev menu → Fail next only — the extras were more to explain than they were worth |

## Decisions I made myself

- Soft archive with cascade and restore (not hard-delete-only).
- No domain persistence; only `flowboard.theme` in `localStorage`.
- Grant `view` effect so Carol can demo read-only Backlog.
- Documented the full-domain optimistic rollback race instead of blocking delivery on per-mutation undo.
- Stretch extras after the required features: dark mode, shortcuts, grants dialog, brand assets.

When I correct the agent again, I append a row under **Corrected or rejected** with the file/area and the rule that won.
