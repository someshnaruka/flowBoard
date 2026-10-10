# T05: Hierarchy service

**Milestone:** M2 Domain logic (model + controller)
**Status:** Done

## Goal
Safe container CRUD, move, reorder and archive.

## Requirements
- createNode, renameNode, moveNode, reorderNode, archiveNode (cascade), restoreNode
- Valid parent map, no cycles, nothing under lists
- Return Result, never throw

## Acceptance criteria
- [x] Tests: valid/invalid parents, cycle, archive cascade + restore, reorder

## Commit plan
- [x] `feat(model): create, rename and validate parents (T05)`
- [x] `feat(model): move, reorder, archive and restore (T05)`
- [x] `test(model): hierarchy edge cases (T05)`

## AI notes
_What Cursor got right, what I corrected or rejected._
