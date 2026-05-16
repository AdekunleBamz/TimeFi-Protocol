# SDK build artifact cleanliness note

After `npm run sdk:build`, check whether generated `sdk/dist` files are intentionally tracked for the release.

Do not mix SDK build output with unrelated docs or contract commits.

If the package is not being published, leave local build artifacts out of the change set.
