# Contributing to OUR TUBE

Thanks for helping build an open video platform. This project is intentionally small, dependency-light, and easy to fork.

## Ways to contribute

- Report bugs and confusing UX.
- Suggest features that keep the platform simple and open.
- Improve accessibility, performance, documentation, or responsive design.
- Publish a channel using the [`channel-template`](./channel-template) and add the `openyoutube-channel` topic.
- Submit code through a focused pull request.

## Development setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

A `GITHUB_TOKEN` is recommended. Create one at <https://github.com/settings/tokens> with no scopes.

## Before opening a pull request

Run:

```bash
npm run typecheck
npm run build
```

Keep pull requests focused. Describe the problem, the approach, and any manual testing you performed. Include screenshots for visual changes and mention both light and dark mode.

## Code guidelines

- Use TypeScript with strict typing.
- Keep server-only code in `lib/` and avoid importing it into client components except for types.
- Prefer the existing components and Tailwind tokens (`bg-card`, `text-muted`, `border-border`, etc.).
- Do not add a UI component library for a small feature.
- Keep GitHub API access validated with Zod.
- Preserve graceful failure: a broken channel must never break discovery for everyone else.
- Do not commit secrets, `.env` files, or media files.
- Do not add comments that merely restate the code.

## Channel data changes

Channels are independent repositories. Do not add channel content to this repository unless you are improving the template. If you are building a channel, use the template and add the `openyoutube-channel` topic to your own public repository.

## Commit and PR style

- Use clear, imperative commit messages.
- Avoid unrelated formatting churn.
- One logical change per pull request.
- Link the relevant issue when one exists.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
