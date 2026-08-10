# Completion Evidence Checklist

Use this checklist for every migration task. A task is not complete until every applicable item is addressed with evidence.

## Required Evidence

1. Files created.
2. Files modified.
3. Files deleted.
4. Why each change was necessary.
5. Folder tree before and after.
6. Imports changed.
7. Commands executed.
8. Complete terminal output summary with key lines.
9. Lint output.
10. Test output.
11. Build output.
12. Warnings.
13. Skipped tasks.
14. Explicit statement when no tests exist:

   Tests are not implemented.

## Reporting Rules

1. Do not claim test pass unless real test files were executed.
2. Do not claim architecture health if dependency graph is missing meaningful edges.
3. If history is unavailable (for example, no git metadata), state this explicitly and provide the best available alternative evidence.
4. Distinguish compatibility shims from real implementation moves.
5. If a service is scaffold-only, report it as incomplete.

## Service Completion Gate

A standalone service is complete only if all are true:

1. Controllers exist and are used.
2. Routes exist and are mounted.
3. Services exist and contain business logic.
4. Validation exists and is enforced.
5. Models exist for required persistence behavior.
6. Tests exist.
7. Build target exists and runs.
8. Health endpoint exists and responds.
9. No runtime dependency on old module paths remains.

If any condition fails, keep work in modular monolith scope.
