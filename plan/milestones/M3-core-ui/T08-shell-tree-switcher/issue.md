# T08: App shell, sidebar tree, user switcher

**Milestone:** M3 Core UI
**Status:** Done

## Goal
One coherent app chrome with permission-aware navigation.

## Requirements
- AppShell: sidebar 260px (collapses to 56px rail), top bar 48px, main
- Tree rows 28px, lucide icons, lock icon on private, hover + and menu
- UserSwitcher with role badge and 'Viewing as' toast
- Skeleton on first load

## Acceptance criteria
- [x] Switching Alice/Bob/Carol visibly changes the tree

## Commit plan
- [x] `feat(view): app shell layout (T08)`
- [x] `feat(view): sidebar tree from visible-tree selector (T08)`
- [x] `feat(view): user switcher with toast (T08)`

## Tested
- [x] `npm run typecheck` / `test` / `build` / `lint`
- [x] Sidebar collapse 260↔56
- [x] Alice/Bob/Carol switch changes visible tree (permissions)
- [x] List select updates top bar title
- [x] User switcher role badge + “Viewing as” toast
- [x] Tree skeleton on first load  
See also `plan/TESTED.md`.

## AI notes
_Shell layout + tree wired to selectors; toast on switchUser. No Figma pull (rate limit earlier)._
