# T16: Card interactions

**Milestone:** M5 Polish and delivery
**Status:** Done

## Goal
Quick edits without opening the drawer.

## Requirements
- Hover menu (open, duplicate, archive, delete)
- Priority, assignee and due-date popovers
- Stop click-through to drawer
- Keyboard shortcuts (see Figma 24–25): `/` search, `C` create task, `?` cheatsheet, `Esc` close, `1`/`2` board/list, `[` sidebar, `Enter` open card, `⌘D` duplicate, `⌘E` archive, `⌘⌫` delete, `⌘⇧L` cycle theme
- Shortcuts overlay lists all bindings; ignore shortcuts when focus is in an input/textarea

## Acceptance criteria
- [x] Permissions respected in every popover
- [x] `?` opens cheatsheet; `/` and `C` work from board and list when not typing

## Commit plan
- [x] `feat(board): card hover menu (T16)`
- [x] `feat(board): inline priority, assignee and date popovers (T16)`
- [x] `feat(shortcuts): global bindings and cheatsheet (T16)`

## AI notes
- Added `archiveTask`/`restoreTask` (soft archive + undo) since T16 requires Archive / ⌘E.
- `/` focuses view-bar search input; filtering lands in T17.
_What Cursor got right, what I corrected or rejected._
