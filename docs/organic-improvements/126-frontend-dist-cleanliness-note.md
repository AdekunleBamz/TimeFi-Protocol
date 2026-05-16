# Frontend dist cleanliness note

After a Vite production build, confirm generated `frontend/dist` output is not mixed into source commits unless release packaging requires it.

If bundle size changes are relevant, capture the build summary in the PR instead of committing transient artifacts.

This keeps Vercel deployments driven by source and lockfile state.
