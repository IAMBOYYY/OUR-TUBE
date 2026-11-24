# OUR TUBE

An open-source, community-powered video platform. Channels live in public GitHub repositories, media lives on real object storage, and the feed is discovered through a GitHub topic — no database required.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Zod**. Designed to deploy for free on **Vercel**.

## Why OUR TUBE?

- **Open discovery** — any public repository with the `openyoutube-channel` topic can appear.
- **Creator-owned media** — videos are hosted on GitHub Releases, Cloudflare R2, or any direct-URL host.
- **No database** — GitHub is the index and the source of truth.
- **Fast, clean viewing** — responsive grid, dark mode by default, search, filters, and random suggestions.
- **Forkable** — the whole platform is MIT licensed and easy to self-host.

## Features

- Community discovery feed with a random shuffle on every load.
- Search by video title, channel name, or tag.
- Filter chips for **All**, **Videos**, and **Music**.
- Channel pages with banner, logo, description, and uploads.
- Watch pages with an HTML5 video player, an audio player for music, and eight random suggestions.
- Dark mode by default with a persistent light/dark toggle.
- Responsive layouts, rounded cards, hover states, and skeleton loaders.
- Zod-validated channel data with graceful skipping of broken repositories.
- Five-minute caching through Next.js `fetch` revalidation.

## Quick start

```bash
git clone https://github.com/IAMBOYYY/OUR-TUBE.git
cd OUR-TUBE
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

`GITHUB_TOKEN` is optional for local development, but strongly recommended. Unauthenticated GitHub search requests are heavily rate-limited. Create a fine-grained or classic token with no scopes — public read access is enough.

```dotenv
GITHUB_TOKEN=github_pat_...
```

## How discovery works

1. `lib/github.ts` calls GitHub's repository search API for `topic:openyoutube-channel`.
2. For each repository, it reads `channel.json` and `videos.json` from `raw.githubusercontent.com` on the repository's **default branch**.
3. Both files are validated with Zod. Invalid, missing, or unreachable files cause that repository to be skipped without breaking the rest of the feed.
4. Responses are cached for 300 seconds using Next.js `fetch` revalidation.
5. Relative asset paths in the JSON are resolved against the repository's raw URL, so `assets/logo.png` works out of the box.

The public API in `lib/github.ts`:

```ts
getChannels(): Promise<Channel[]>
getChannel(owner: string, repo: string): Promise<Channel | null>
getAllVideos(): Promise<VideoWithChannel[]>
```

## Publish a channel

The fastest path is the [`channel-template`](./channel-template) folder.

1. Create a new **public** GitHub repository from the template.
2. Edit `channel.json` and `videos.json`.
3. Replace `assets/logo.png` and `assets/banner.png`.
4. Upload video/audio files to **GitHub Releases** or **Cloudflare R2** — never commit large media to the repository.
5. Add the topic **`openyoutube-channel`** to the repository.
6. Wait for the five-minute cache to refresh.

Read the full guide in [`channel-template/README.md`](./channel-template/README.md).

### Example `channel.json`

```json
{
  "name": "Open Studio",
  "description": "Films, tutorials, and late-night synthwave.",
  "logo": "assets/logo.png",
  "banner": "assets/banner.png"
}
```

### Example `videos.json`

```json
[
  {
    "id": "welcome",
    "title": "Welcome to Open Studio",
    "description": "A short introduction.",
    "thumbnail": "https://cdn.example.com/welcome.jpg",
    "videoUrl": "https://cdn.example.com/welcome.mp4",
    "type": "video",
    "tags": ["welcome", "open source"],
    "date": "2026-01-15"
  }
]
```

`type` must be `"video"` or `"music"`. Music entries use the audio player.

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Add `GITHUB_TOKEN` under **Project Settings → Environment Variables**.
4. Deploy.

No database, storage bucket, or extra services are required. The app uses ISR and can run entirely on Vercel's free tier.

## Project structure

```text
app/
├── page.tsx                       # Discovery feed
├── channel/[owner]/[repo]/        # Channel page + loading skeleton
├── watch/[owner]/[repo]/[id]/     # Watch page + loading skeleton
├── layout.tsx                     # Theme bootstrap, header, footer
├── loading.tsx
├── error.tsx
├── not-found.tsx
└── globals.css
components/                        # Cards, search/filter, players, UI
lib/
├── github.ts                      # GitHub discovery + Zod validation
├── types.ts
├── constants.ts
└── utils.ts
channel-template/                  # Starter repo for creators
```

## Commands

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # TypeScript check
```

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | Recommended | Raises GitHub API rate limits. No scopes are needed for public repositories. |

Never expose `GITHUB_TOKEN` to the client. It is only read in server-side code under `lib/github.ts`.

## Contributing

Issues and pull requests are welcome. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before opening a PR.

## License

[MIT](./LICENSE) © OUR TUBE contributors.
