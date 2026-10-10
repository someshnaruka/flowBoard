# Cursor prompt template

```
Context: Flowboard (see .cursor/rules/, plan/project.md, and Figma UI).
Figma (visual source of truth): https://www.figma.com/design/0D1riu0d45cFBhWbRUUTjd/Flowboard-UI-Design
Implement issue <ID> in plan/milestones/<milestone>/<task>/issue.md.
Read the issue first. Match the relevant Figma screen(s) for any UI.
Do only the current commit step: <step>.
Follow MVC rules, Tailwind only, no new dependencies.
First give me a short plan and the files you will touch, then implement.
```

After each step: run typecheck and tests, review the diff, commit, tick the box in the issue.
