# T14: CRUD flows and tree management

**Milestone:** M4 Flows and feedback
**Status:** Done

## Goal
Complete create/rename/archive/delete experience.

## Requirements
- Create/rename/archive/restore spaces, folders, lists via menu
- Sibling reorder in tree
- Task create (quick-add, + Task), duplicate, delete with ConfirmDialog
- Undo toast for archive
- Sidebar **Archived** section to restore later

## Acceptance criteria
- [x] Every destructive action is confirmed and explains consequences

## Commit plan
- [x] `feat(tree): container create, rename and archive (T14)`
- [x] `feat(tree): restore and sibling reorder (T14)`
- [x] `feat(task): create, duplicate and delete flows (T14)`
- [x] `feat(tree): archived section restore (T14)`

## Tested
- [x] `npm run typecheck` / `test` / `build`
- [x] Store: create list + default statuses; archive/restore; duplicate/delete
- [x] Manual: tree + / ⋯ menus; archive ConfirmDialog + Undo toast; drawer Duplicate/Delete
- [x] Manual: Archived section Restore brings containers back

## AI notes
New lists get default To do / In progress / Done statuses. Tree hides archived nodes; restore via Undo toast or Archived section (archive roots only).
