# Contributing to Ikigai Collective

Thanks for helping. This repo holds the Ikigai Collective website and its Lab Notes.

## Where the work happens

- The new site lives on the **`site-v2`** branch, in the **`site/`** folder. `site-v2` becomes `main` when we switch over, so please target `site-v2` for site work.
- `main` and `site-v2` are protected: every change comes in through a pull request, not a direct commit.
- **Larger changes start with an issue.** New pages, structural or design changes, new dependencies, or anything touching the build or deployment: open an issue first so we can agree on the approach. Small fixes (typos, broken links, small bugs) can go straight to a PR.

## The one exception: the Substack import

New Lab Notes are imported from Substack by a daily automated job (`site/api/cron/substack.ts`, with `.github/workflows/substack.yml` as a manual fallback). It commits new notes directly to `site-v2` under `site/src/content/notes/` and `site/src/assets/covers/`. Don't hand-edit imported notes unless the change is agreed in an issue, since edits should usually happen on Substack.

## The stack and build

- [Astro](https://astro.build) static site, Tailwind CSS 4 with daisyUI, TypeScript, Node 22.
- Lab Notes are a content collection (`site/src/content/notes/*.md`, schema in `site/src/content.config.ts`).
- The build also generates `sitemap.xml`, `robots.txt`, `llms.txt`, the Lab Notes RSS feed (`/lab-notes/rss.xml`) and a markdown twin of every page (`<url>.md`, via `site/scripts/build-md.mjs`).
- Hosted on Vercel (`site/vercel.json` holds redirects and the cron), with serverless functions in `site/api/`.

```sh
cd site
npm ci
npm run dev       # local dev server at http://localhost:4321
npm run build     # production build to site/dist/
npm run preview   # serve the build locally
npm test          # all test scripts (CI runs this and the build on every pull request)
```

Please make sure `npm run build` passes before opening a PR.

## Pull requests

- Branch from `site-v2`, keep each PR focused, and describe what changed and why.
- Link the issue for larger changes.
- Commit messages follow the existing style: `feat: ...`, `fix: ...`, `docs: ...`, `content: ...`.

## Where to talk

- **GitHub Discussions**: code and repo topics (how the site is built, proposals, questions about a PR).
- **Discord**: the community conversation. It stays there.

## License

By contributing you agree that code is released under the [MIT License](LICENSE) and content (Lab Notes, prose, images) under [CC BY-SA 4.0](LICENSE-CONTENT). The Ikigai Collective logo and mark are not covered by either license.
