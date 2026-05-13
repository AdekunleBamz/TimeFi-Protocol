# Theme Storage Recovery

## Summary
Handle theme preference storage failures gracefully.

## Changes
- Fall back to system theme when persisted preference cannot be read.
- Avoid blocking app startup on storage errors.
- Recheck contrast after fallback theme selection.

## Date
2026-05-13
