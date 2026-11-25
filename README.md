# OurTube

OurTube is a free, open-source video and music site. Anyone can create a channel with just a GitHub repo. No approval needed.

**[Live site](https://our-tube-nine.vercel.app/)** | **[Create a channel](https://github.com/IAMBOYYY/Channel-template)** | **[Contribute](https://github.com/IAMBOYYY/OUR-TUBE/blob/main/CONTRIBUTING.md)**

## How it works

- Every channel is a normal public GitHub repo.
- The repo has the topic `openyoutube-channel`.
- OurTube finds all repos with that topic automatically.
- It reads `channel.json` and `videos.json` from each one.
- Videos are stored in GitHub Releases (free), not in the repo.

```text
Your GitHub repo (public, topic: openyoutube-channel)
        |
        |  channel.json + videos.json
        v
     OurTube  (reads the files and shows your channel)
        |
        |  videoUrl points to a Release file
        v
GitHub Releases  (stores your video files for free)
```

## Create your channel

This is the most important part. Follow the steps in order.

### Step 1: Make your repo from the template

Open the template: <https://github.com/IAMBOYYY/Channel-template>

Tap **Use this template** > **Create a new repository**.

Name it anything you like. Choose **Public**.

Do **NOT** fork it. Forks are not listed.

### Step 2: Edit `channel.json`

Set `"name"` and `"description"`.

Replace `assets/logo.png` (square, 400x400) and `assets/banner.png` (2048x512) with your own images.

```json
{
  "name": "My Channel",
  "description": "Videos about things I love.",
  "logo": "assets/logo.png",
  "banner": "assets/banner.png"
}
```

### Step 3: Upload your video

Go to **Releases** > **Create a new release**.

Type a tag (for example `video1`).

IMPORTANT: Attach the video using the **"Attach binaries by dropping them here or selecting them"** box at the bottom. Do **not** put the file inside the description text box.

Wait for the upload to finish, then tap **Publish release**.

### Step 4: Copy the video link

On the release page, find the video file under **Assets**.

Long-press it and copy the link address. It must look like this:

```text
https://github.com/USERNAME/REPO/releases/download/TAG/FILE.mp4
```

It must contain `/releases/download/`. A link containing `/releases/tag/` will **NOT** play.

### Step 5: Add the video to `videos.json`

Add your video as a new entry in the list. Here is a full example:

```json
[
  {
    "id": "my-first-video",
    "title": "My First Video",
    "description": "This is my first video on OurTube.",
    "thumbnail": "assets/my-first-video.jpg",
    "videoUrl": "https://github.com/USERNAME/REPO/releases/download/video1/my-first-video.mp4",
    "duration": "3:20",
    "type": "video",
    "tags": ["intro", "first"],
    "date": "2026-11-04"
  }
]
```

| Field | What it is | Required |
| --- | --- | --- |
| `id` | Unique name for the video, no spaces | Yes |
| `title` | Video title shown on the site | Yes |
| `description` | Short text about the video | Yes |
| `thumbnail` | Path or link to a 1280x720 image | No |
| `videoUrl` | Direct file link from GitHub Releases | Yes |
| `duration` | Length, like `3:20` | No |
| `type` | `"video"` or `"music"` | Yes |
| `tags` | List of keywords | No |
| `date` | Upload date as `YYYY-MM-DD` | Yes |

The date format is `YYYY-MM-DD`, for example `2026-11-04`. Always use zeros.

`type` is `"video"` or `"music"`. Duration and tags are optional.

### Step 6: Add a thumbnail

Put a 1280x720 image in the `assets/` folder.

Then set `"thumbnail": "assets/your-image.jpg"`.

If you skip this, OurTube uses the first frame of the video.

### Step 7: Make your channel appear

On your repo page, tap the gear icon next to **About**.

Add the topic `openyoutube-channel` and save.

### Step 8: Wait about 5 minutes

Your channel and videos will show up on the live site.

## Uploading more videos later

1. Upload the new video to **Releases** and publish it.
2. Copy the direct link from **Assets** (it must contain `/releases/download/`).
3. Add a new entry to `videos.json`.
4. Add a thumbnail in `assets/` and set it in the entry.

That is the same as steps 3 to 6.

## Tips and troubleshooting

- **Video does not play:** `videoUrl` must be the direct file link (`/releases/download/`), not the release page link.
- **Use `.mp4` (H.264).** `.mov` and `.mkv` often do not play in browsers.
- **Avoid spaces in file names.**
- **Channel not showing:** the repo must be Public, the topic must be exactly `openyoutube-channel`, the JSON files must be valid (check at [jsonlint.com](https://jsonlint.com)), and you may need to wait 5 minutes.
- **Never put video files inside the repo itself.** GitHub rejects files over 100 MB. Use Releases (up to 2 GB per file).
- **Do not add the topic to the template repo itself.**

## For developers: run and deploy

OurTube is built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

### Run it locally

```bash
git clone https://github.com/IAMBOYYY/OUR-TUBE.git
cd OUR-TUBE
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

Add `GITHUB_TOKEN` to `.env.local`. Use a GitHub classic token with no scopes. This is optional but recommended, because it raises GitHub API rate limits.

```dotenv
GITHUB_TOKEN=your_token_here
```

### Deploy to Vercel

1. Import the repo on [Vercel](https://vercel.com/new).
2. Add `GITHUB_TOKEN` in the environment variables.
3. Deploy.

It works on the free plan. No database or extra services are needed.

### Project structure

```text
app/                 Pages: home feed, channels, channel, watch
components/          Cards, header, players, search, UI
lib/                 GitHub discovery, types, constants, helpers
channel-template/    Starter repo for creators
```

## Contributing

Read [CONTRIBUTING.md](https://github.com/IAMBOYYY/OUR-TUBE/blob/main/CONTRIBUTING.md) first.

Ideas are welcome: better search, playlists, comments, and subscriptions. Open an issue or send a pull request on the [main repo](https://github.com/IAMBOYYY/OUR-TUBE).

## License

MIT. See [LICENSE](./LICENSE).
