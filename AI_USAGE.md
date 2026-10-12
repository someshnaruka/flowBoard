# AI usage log

Cursor (Composer / agent) was used throughout the Flowboard take-home. This log summarizes what the AI did well, what was corrected or rejected, and where human judgment drove the design.

## What AI got right

- Scaffolding the MVC split (`model` / `controller` / `view`) and keeping services pure with `Result<T>`.
- Wiring dnd-kit board + tree reorder, Zustand mutation pipeline, and permission selectors consistent with the project rules.
- Generating shadcn-style primitives under `src/view/ui` and aligning density with Figma (shell heights, column width, badges).
- Producing Vitest coverage for services/store and a Playwright Alice→Bob permission E2E.
- Fast iteration on Figma-driven polish (status/priority tokens, dark mode, dialogs, list Load more).

## What was corrected or rejected

| Topic | Correction |
| --- | --- |
| Badge borders / hardcoded hex stacks | Rejected; kept Figma 05 borderless badges + Tailwind status/priority tokens |
| Confirm dialogs on `AlertDialog` | Switched to `Dialog` so outside-click dismiss works; modal overlay blocks board interaction |
| Drawer closing under confirm | Overlay marked `data-flowboard-modal-overlay` so TaskDrawer ignores those clicks |
| Status dots on badges | Removed after Figma review; column dots remain |
| List “infinite” scroll | Spec’d as offset pagination (page size 10) + Load more, not infinite |
| User switcher copy | Display names Alice/Bob/Carol; capitalize role separately |
| Inline styles | Only dnd-kit exceptions; removed `react-window` (pagination covers list length) |
| Lint `setState` in effects | Refactored BoardWorkspace, board DnD columns, ListView paging, SearchInput, DrawerPanel, RenameDialog, autosave ref sync |
| Status model | Added required `color` field and wired column dots / badges through a hex→token map |
| Network simulation | Dev menu → Fail next (`failNext`) only |

## Human-owned decisions

- Soft archive + cascade/restore instead of hard-delete-only.
- No domain persistence; theme-only `localStorage`.
- Grant `view` effect for Bob/Carol-style demos.
- Documented full-domain rollback race as a trade-off rather than blocking delivery.
- Stretch: dark mode, shortcuts, grants dialog, brand assets.

## How to extend this log

When correcting the agent again, append a dated bullet under **Corrected or rejected** with the file/area and the rule that won (Figma, brief, or project rules).
