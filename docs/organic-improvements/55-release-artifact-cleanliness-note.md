# Release Artifact Cleanliness

## Summary
Before release, confirm generated build output and local deployment metadata are not staged.

## Checks
- Inspect git status after production builds.
- Leave `.vercel/`, `dist/`, and local env files uncommitted.
- Note any intentional generated artifact in the release ticket.
