# Contributing to OurTube

Thanks for helping build an open video platform. This project is intentionally
small, dependency-light and easy to fork.

## Ways to contribute

- Report bugs and confusing UX.
- Suggest features that keep the platform simple and open.
- Improve accessibility, performance, documentation or responsive design.
- Publish a channel using the [`channel-template`](./channel-template) and add
  the `openyoutube-channel` topic.
- Submit code through a focused pull request.

## Development setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

A `GITHUB_TOKEN` is optional. Create one at
<https://github.com/settings/tokens> with no scopes. It raises GitHub API rate
limits.

There is no database and no auth. Do not add Supabase, Firebase, an ORM or a
login flow. The site must work with no environment variables.

## Before opening a pull request

Run:

```bash
npm run typecheck
npm run build
```

Keep pull requests focused. Describe the problem, the approach and any manual
testing you did. Include screenshots for visual changes and mention both light
and dark mode.

## Design rules

- GitHub-only. Channels are public repos with the topic
  `openyoutube-channel`.
- Discovery uses the GitHub Search API. Files come from
  `raw.githubusercontent.com`. Media comes from GitHub Release assets.
- Subscribers are the repo's stars. Subscribe follows in `localStorage`
  (`ourtube:following`).
- Likes, watch later and history are `localStorage` only. No global counts.
- Views do not exist. Do not add view counts or increment logic.
- On-site comments do not exist. Use the optional GitHub Discussions button.
- Keep the data layer separate from the UI so a database could be added later
  without rewriting pages.
- A broken channel must never break the site. Validate with zod `safeParse`,
  log a warning and skip only the broken part.
- Keep the flat style: no gradients, shadows, glow or emoji. Neutral grey
  palette, thin borders, system font stack, `lucide-react` icons, light/dark
  theme. Red only for the logo icon, active tab underline, Shorts icon and
  video progress.
- Tunable numbers live in `lib/constants.ts`
  (`SHORTS_MAX_SECONDS = 60`, `CACHE_SECONDS = 300`).
- Pages that load all channel data use `export const maxDuration = 60`.
- Old channel data must keep working, including dates like `2026-11-4` and
  manual durations like `1:00`.

## Code guidelines

- Use TypeScript with strict typing.
- Keep server-only code in `lib/` and avoid importing it into client components
  except for types.
- Prefer the existing components and Tailwind tokens (`bg-card`, `text-muted`,
  `border-border`, etc.).
- Do not add a UI component library for a small feature.
- Keep GitHub API access validated with zod.
- Do not commit secrets, `.env` files or media files.
- Do not add comments that merely restate the code.

## Channel data changes

Channels are independent repositories. Do not add channel content to this
repository unless you are improving the template. If you are building a
channel, use the template and add the `openyoutube-channel` topic to your own
public repository.

When you change the template, remember that creators copy the folder including
the hidden `.github` workflow folder.

## Moderation

Use `blocklist.json` at the repo root to hide an owner, a repo or a single
video:

```json
{
  "owners": [],
  "repos": ["owner/repo"],
  "videos": ["owner/repo/video-id"]
}
```

The filter runs in the data layer, so blocked items do not appear anywhere.

## Commit and PR style

- Use clear, imperative commit messages.
- Avoid unrelated formatting churn.
- One logical change per pull request.
- Link the relevant issue when one exists.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).
