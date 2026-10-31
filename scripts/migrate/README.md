# Migration scripts (historical)

These scripts built the site's first content from the previous stride-social.com:

- `extract-content.mjs`, `download-assets.mjs` and `download-flowdrive.mjs` ran in Phase 1.
- `phase-3-content.mjs` and `shorten-asset-names.mjs` ran in Stage 2.

The Phase 1 content and data they read were retired in Stage 8, once the last Phase 1 pages were replaced. To re-run them, check out git tag `phase-1-recreation`, or commit `4239b7e` for the Stage 2 inputs.

Content in `src/content/` has been edited by hand since, so never re-run a migration over it.
