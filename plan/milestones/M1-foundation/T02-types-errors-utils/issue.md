# T02: Types, errors, ids and positions

**Milestone:** M1 Foundation
**Status:** Done

## Goal
Typed domain core used by every other layer.

## Requirements
- types.ts: ContainerNode, Task, Status, User, Grant, AppState (normalised by id)
- errors.ts: ErrorCode, Result<T>, ok(), fail()
- id.ts: newId() wrapping crypto.randomUUID()
- position.ts: between/after/before fractional helpers + rebalance

## Acceptance criteria
- [x] position.ts unit tests pass
- [x] No React imports in model/

## Commit plan
- [x] `feat(model): add domain types and result/error helpers (T02)`
- [x] `feat(model): add id and fractional position utils with tests (T02)`

## AI notes
_What Cursor got right, what I corrected or rejected._
