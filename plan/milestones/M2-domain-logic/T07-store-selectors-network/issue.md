# T07: Store, selectors, simulated network

**Milestone:** M2 Domain logic (model + controller)
**Status:** Todo

## Goal
Controller layer that gates every mutation.

## Requirements
- createFlowStore(seed) factory + useFlowStore hook (Zustand + Immer)
- Pipeline: assertCan -> service -> simulateNetwork -> apply
- selectVisibleTree, selectTasksForList, selectCurrentUser
- simulateNetwork: latency, failureRate, failNext
- UI state: selectedListId, view, drawerTaskId, expandedNodeIds; switchUser resets invalid selection and closes drawer

## Acceptance criteria
- [ ] Tests: Bob blocked on denied list (FORBIDDEN), switching user changes tree, failNext surfaces NETWORK_ERROR

## Commit plan
- [x] `feat(controller): zustand store skeleton and selectors (T07)`
- [ ] `feat(controller): permission-gated mutation pipeline (T07)`
- [ ] `feat(controller): network simulation (T07)`
- [ ] `test(controller): store permissions and failures (T07)`

## AI notes
_What Cursor got right, what I corrected or rejected._
