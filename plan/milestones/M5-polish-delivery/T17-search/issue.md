# T17: Client-side search

**Milestone:** M5 Polish and delivery
**Status:** Done

## Goal
Fast filtering inside the current list.

## Requirements
- Debounced 200ms title/description filter with highlight
- Empty search state

## Acceptance criteria
- [x] Works in board and list views

## Commit plan
- [x] `feat(search): selector and debounced input (T17)`
- [x] `feat(search): highlight and empty state (T17)`

## AI notes
- View-bar input debounces into `searchQuery`; clears on list switch; `/` still focuses the field.
_What Cursor got right, what I corrected or rejected._
