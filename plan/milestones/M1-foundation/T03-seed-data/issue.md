# T03: Seed fixtures

**Milestone:** M1 Foundation
**Status:** Todo

## Goal
Realistic data that makes the Alice vs Bob demo obvious.

## Requirements
- 1 workspace, 2 spaces (Engineering public, Leadership private), 2 folders, 3 lists, 18+ tasks, 3 users
- Readable fixed ids (user-alice, list-backlog)
- Grants: Bob denied Leadership and one Engineering list; Carol allowed into Leadership, denied a different list
- Comment table documenting the grants matrix

## Acceptance criteria
- [ ] createSeed() returns valid AppState
- [ ] Mix of priorities, assignees and overdue dates

## Commit plan
- [x] `feat(model): seed hierarchy, users and statuses (T03)`
- [ ] `feat(model): seed tasks and permission grants (T03)`

## AI notes
_What Cursor got right, what I corrected or rejected._
