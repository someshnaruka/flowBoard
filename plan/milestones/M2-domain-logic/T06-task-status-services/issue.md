# T06: Task and status services

**Milestone:** M2 Domain logic (model + controller)
**Status:** Todo

## Goal
Task rules and status integrity.

## Requirements
- createTask, updateTask, deleteTask, changeStatus, reorderTask, moveTaskToList (status remap by category)
- Title 1-500 chars, status must belong to list, list not archived
- Optional subtasks depth 1
- Status add/rename/reorder/delete (block delete if in use)

## Acceptance criteria
- [ ] Tests for success and failure paths

## Commit plan
- [x] `feat(model): task create, update and validation (T06)`
- [x] `feat(model): status change, reorder and move between lists (T06)`
- [ ] `feat(model): status service (T06)`
- [ ] `test(model): task and status edge cases (T06)`

## AI notes
_What Cursor got right, what I corrected or rejected._
