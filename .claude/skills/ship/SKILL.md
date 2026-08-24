---
name: ship
description: Typecheck and commit the pending changes. Use when the user wants to ship, commit, or land the current work.
---

# Ship

Verify and commit my pending changes for $ARGUMENTS.

1. Run `npx tsc --noEmit` and make sure it passes before committing.
2. Stage the changes and write a commit message from the actual diff — short imperative subject, body only if the diff needs explaining. Make $ARGUMENTS the scope of the subject; if I didn't give one, read it from the diff.
3. Confirm with the commit hash.
4. Do not write attribution notes to anyone.
