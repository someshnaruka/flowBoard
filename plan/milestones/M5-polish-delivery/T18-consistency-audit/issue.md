# T18: Spacing and density audit

**Milestone:** M5 Polish and delivery
**Status:** Done

## Goal
One product feel.

## Requirements
- Audit against `.cursor/rules/flowboard.mdc` tokens: padding, row heights, truncation (min-w-0), focus rings, hover states, icon sizes
- Only tree/board/list regions scroll

## Acceptance criteria
- [x] No obvious UI inconsistencies

## Commit plan
- [x] `style: normalise spacing and sizes (T18)`
- [x] `style: focus, hover and truncation fixes (T18)`

## AI notes
- Figma MCP: Full seat works; used page metadata + 4 screenshots (board, components, drawer, states) then code fixes.
- Shell aligned to Figma: TopBar breadcrumbs + search + Dev/User; ViewBar title + Board/List + Task; toast left borders; column status dots; sidebar “Flowboard HQ”.
_What Cursor got right, what I corrected or rejected._
