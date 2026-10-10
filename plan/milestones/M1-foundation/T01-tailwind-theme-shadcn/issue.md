# T01: Tailwind theme and shadcn/ui

**Milestone:** M1 Foundation
**Status:** Todo

## Goal
Violet design tokens and base UI primitives.

## Requirements
- Tailwind v3.4 with tokens: colors.brand (violet), status.*, priority.*, fontFamily, borderRadius, boxShadow
- Dark mode via `class="dark"` on `<html>` + shadcn dark CSS variables (see Figma screens 21–26)
- Theme preference: Light | Dark | System; persist in `localStorage` key `flowboard.theme` (UI preference only)
- index.css contains only Tailwind directives + shadcn variables (light + dark)
- shadcn init with components path src/view/ui
- Add button, sheet, alert-dialog, dropdown-menu, context-menu, popover, select, sonner, skeleton, badge, avatar, input, textarea, tooltip, collapsible, toggle-group, scroll-area, calendar, command

## Acceptance criteria
- [ ] Test page shows button, badge and toast using theme tokens
- [ ] Toggling Light/Dark/System updates surfaces; System follows `prefers-color-scheme`

## Commit plan
- [x] `feat(ui): configure tailwind theme tokens (T01)`
- [x] `feat(ui): initialise shadcn/ui and add base components (T01)`
- [ ] `feat(ui): dark mode tokens and theme preference (T01)`

## AI notes
_What Cursor got right, what I corrected or rejected._
