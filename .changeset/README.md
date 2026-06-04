This folder is managed by Changesets.

Typical release flow:

1. Create a changeset for package changes:
   `pnpm changeset`
2. Apply version bumps:
   `pnpm version:packages`
3. Publish packages:
   `pnpm release`
