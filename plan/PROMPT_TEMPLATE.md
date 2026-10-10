# Cursor prompt template

```
Context: Flowboard (see .cursorrules and plan/project.md).
Implement issue <ID> in plan/milestones/<milestone>/<task>/issue.md.
Read the issue first. Do only the current commit step: <step>.
Follow MVC rules, Tailwind only, no new dependencies.
First give me a short plan and the files you will touch, then implement.
```

After each step: run typecheck and tests, review the diff, commit, tick the box in the issue.
