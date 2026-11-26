# OurTube

OurTube is a free, open-source video and music site. Anyone can create a
channel with a public GitHub repository. There is no sign-in, no database and
no backend to run.

**[Live site](https://our-tube-nine.vercel.app/)** | **[Channel template](https://github.com/IAMBOYYY/OUR-TUBE/tree/main/channel-template)** | **[Contribute](https://github.com/IAMBOYYY/OUR-TUBE/blob/main/CONTRIBUTING.md)**

## How it works

- Every channel is a normal public GitHub repo.
- The repo has the topic `openyoutube-channel`.
- OurTube finds repos with that topic through the GitHub Search API.
- It reads `channel.json`, `videos.json`, `posts.json` and `media.json` from the
  repo. All of them are optional.
- Video and audio files live in GitHub Releases, not in the repo.
- Thumbnails, durations and smaller video versions are made by a GitHub Action
  in the channel repo.

```text
Your public GitHub repo (topic: openyoutube-channel)
        |
        |  channel.json, videos.json, posts.json, media.json
        v
     OurTube  (reads files, caches for 5 minutes)
        |
        |  videoUrl points to a Release file
        v
GitHub Releases  (stores your media for free)
```

## GitHub-only design and its limits

OurTube is intentionally stateless. There is no account and no server database.

- **Subscribers** are the repo's GitHub stars. The number is read from GitHub.
  The Subscribe button follows the channel in this browser only.
- **Likes** are saved in this browser only. There is no global like count.
- **Watch later, History and your Library** are saved in this browser only.
- **Views** are not counted or shown.
- **Comments** are not hosted on OurTube. If a channel turns on GitHub
  Discussions, a "Discuss on GitHub" button opens the repo discussions.
- **Reports** open a pre-filled issue on the OurTube repository.

Your data never leaves your device. The trade-off is that follows, likes and
history do not follow you to another device. There is no sign-in anywhere.

The data layer is separate from the UI, so a database could be added later
without rewriting the pages.

## Create your channel

This is the important part. Follow the steps in order.

### Step 1: Use the template

Open the template:
<https://github.com/IAMBOYYY/OUR-TUBE/tree/main/channel-template>

Tap **Use this template** > **Create a new repository**.

Name it anything. Choose **Public**.

Do **NOT** fork it. Forks are not listed.

### Step 2: Edit `channel.json`

Set `name` and `description`. Replace `assets/logo.png` and
`assets/banner.png` with your own images. JPG, PNG and WEBP work.

```json
{
  "name": "My Channel",
  "description": "Videos about things I love.",
  "logo": "assets/logo.png",
  "banner": "assets/banner.png"
}
```

`channel.json` is optional. If it is missing, OurTube uses the repo name, the
repo description and the GitHub avatar.

### Step 3: Upload a video with a release

Go to **Releases** > **Draft a new release**. Type a tag, for example `video1`.

Attach your video using the **Attach binaries by dropping them here or
selecting them** box. Do **not** paste the file into the description.

Publish the release.

Open the **Actions** tab and wait for a green tick. The Action makes a
thumbnail, smaller MP4 versions and a `media.json` file. Do not edit
`media.json` by hand.

### Step 4: Add the video to `videos.json`

On the release page, copy the direct link under **Assets**. It must contain
`/releases/download/`.

Only three fields are required:

```json
[
  {
    "title": "My first video",
    "description": "A short description.",
    "videoUrl": "https://github.com/USERNAME/REPO/releases/download/video1/my-video.mp4"
  }
]
```

OurTube fills in the rest: id, type, date, thumbnail, duration and Shorts.

### Step 5: Add the topic

On the repo page, tap the gear icon next to **About**.

Add the topic `openyoutube-channel` and save.

Wait about 5 minutes. The channel appears on the live site.

### Optional

- **Comments:** open **Settings**, then **Features**, and turn on
  **Discussions**. OurTube shows a "Discuss on GitHub" button.
- **Captions:** add `captions/<video-id>.en.vtt`.
- **Posts:** add short updates to `posts.json`.
- **Custom thumbnail:** add `assets/<video-id>.jpg`.

## Data format

All files are optional. A channel with zero videos still appears.

### `channel.json`

```json
{
  "name": "My Channel",
  "description": "Plain text.",
  "logo": "assets/logo.png",
  "banner": "assets/banner.png"
}
```

### `videos.json`

Only `title` and `videoUrl` are required.

```json
[
  {
    "id": "my-first-video",
    "title": "My first video",
    "description": "Optional.",
    "videoUrl": "https://github.com/USER/REPO/releases/download/video1/file.mp4",
    "thumbnail": "assets/my-first-video.jpg",
    "type": "video",
    "tags": ["intro"],
    "date": "2026-11-04",
    "duration": "3:20",
    "captions": [{ "lang": "en", "label": "English", "url": "captions/my-first-video.en.vtt" }]
  }
]
```

Defaults:

- `id` comes from the file name in `videoUrl`.
- `type` is `music` for audio extensions, otherwise `video`.
- `date` accepts `2026-11-4` and is fixed to `2026-11-04`. If missing, the
  release asset date is used.
- `tags` is an empty list.
- `thumbnail` is found in `assets/` by id, then `assets/thumbnails/`.
- `duration` comes from `media.json`, then the MP4 header, then the manual
  field.
- `isShort` is true for a video of 60 seconds or less.

Old style entries with `id`, `type`, `date: "2026-11-4"`,
`duration: "1:00"` and `thumbnail` still work.

### `posts.json`

```json
[
  {
    "text": "A short update.",
    "image": "assets/update.jpg",
    "date": "2026-11-04"
  }
]
```

`text` is required. `id` and `date` have defaults.

### `media.json`

Made by the Action. Do not edit it. It contains durations, dimensions,
thumbnails and the quality list.

## Moderation with `blocklist.json`

The OurTube repo root has `blocklist.json`:

```json
{
  "owners": [],
  "repos": ["owner/repo"],
  "videos": ["owner/repo/video-id"]
}
```

Blocked owners, repos and videos are filtered out of discovery, search, lists
and pages.

## For developers: run and deploy

OurTube uses **Next.js**, **TypeScript**, **Tailwind CSS**, **zod** and
**lucide-react**.

### Run it locally

```bash
git clone https://github.com/IAMBOYYY/OUR-TUBE.git
cd OUR-TUBE
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

```dotenv
# Optional. Raises GitHub API rate limits. No scopes are needed.
GITHUB_TOKEN=

# Optional. Used by sitemap and robots.
NEXT_PUBLIC_SITE_URL=https://our-tube-nine.vercel.app
```

There are no database keys. The site fully works with no environment
variables.

### Deploy to Vercel

1. Import the repo on [Vercel](https://vercel.com/new).
2. Add `GITHUB_TOKEN` if you want higher GitHub rate limits.
3. Add `NEXT_PUBLIC_SITE_URL` with your domain.
4. Deploy.

The free plan is enough.

### Project structure

```text
app/                 Pages: home, subs, music, channels, shorts, watch, library
components/          Cards, header, player, search, sheets and UI
lib/                 GitHub discovery, types, constants, player helpers
channel-template/    Starter repo for creators (copy the hidden .github folder too)
blocklist.json       Owners, repos and videos to hide
```

## Contributing

Read [CONTRIBUTING.md](https://github.com/IAMBOYYY/OUR-TUBE/blob/main/CONTRIBUTING.md)
first. Ideas and pull requests are welcome.

## License

MIT. See [LICENSE](./LICENSE).
