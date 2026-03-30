# Dependency Update Note

- Upgrade one dependency domain at a time.
- Re-run check and tests after each upgrade.
- Record any sdk behavior changes in changelog.
- Keep lockfile changes in the same commit as manifest edits.
- Re-run `npm ci` after lockfile updates before validating runtime behavior.
