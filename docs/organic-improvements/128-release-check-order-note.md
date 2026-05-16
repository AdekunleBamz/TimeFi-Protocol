# Release Check Order Note

Keep protocol validation ahead of the frontend and SDK builds when preparing release evidence. The Vercel-facing check should come from the same dependency install, with local script-only environment changes left out of the release snapshot.
