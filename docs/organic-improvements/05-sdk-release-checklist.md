# SDK Release Checklist

- Build sdk package before cutting release tags.
- Validate generated types against latest contract schema.
- Smoke test client methods on target network.
- Publish changelog notes with breaking API details.
- Run `npm pack` locally once to verify package contents before publish.
