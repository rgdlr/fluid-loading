# Changesets

Hello and welcome! This folder has been set up with Changesets to automate versioning and changelog management.

## Workflow

1. Run `pnpm changeset` locally when making changes.
2. Select the packages to update and choose semver bump (`patch`, `minor`, `major`).
3. Commit the generated markdown file under `.changeset/`.
4. When merged to `main`, GitHub Actions automatically creates a release PR or publishes to npm.
