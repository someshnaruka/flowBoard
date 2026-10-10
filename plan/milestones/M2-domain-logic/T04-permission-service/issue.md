# T04: Permission service

**Milestone:** M2 Domain logic (model + controller)
**Status:** Todo

## Goal
Single source of truth for who can see and edit what.

## Requirements
- canView, canEdit, filterTree, assertCan (returns Result)
- Admin bypass; nearest grant wins; private hides unless allowed
- Ancestors of an allowed node returned as navigable shells

## Acceptance criteria
- [ ] Tests: admin, public, private, allow overrides private, deny, nearest-wins, shells, Alice/Bob/Carol on seed

## Commit plan
- [x] `feat(model): implement can-view and can-edit rules (T04)`
- [ ] `feat(model): add tree filtering with shell ancestors (T04)`
- [ ] `test(model): permission service coverage (T04)`

## AI notes
_What Cursor got right, what I corrected or rejected._
