---
name: ship
description: Verify, commit, and push the pending changes. Use when the user wants to ship, commit and push, or land the current work.
---

# Ship

Verify, commit, and push my pending changes for $ARGUMENTS.

1. Run `npx tsc --noEmit` and make sure it passes before committing.
2. Stage the changes and write a commit message from the actual diff — short imperative subject, body only if the diff needs explaining. Make $ARGUMENTS the scope of the subject; if I didn't give one, read it from the diff.
3. Push to the remote branch.
4. Confirm with the commit hash and the pushed branch name. Never force-push.
5. Do not write attribution notes to anyone.
