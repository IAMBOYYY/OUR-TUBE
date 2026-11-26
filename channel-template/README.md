# Make your OurTube channel

This folder is your channel. It lives in a normal public GitHub repository.

OurTube finds public repos with the topic `openyoutube-channel` and shows them
as channels.

Short sentences. Small steps. Take your time.

## 1. Use this template

Open the template repository on GitHub.

Tap **Use this template** > **Create a new repository**.

Choose **Public**.

Do **NOT** fork it. Forks are not listed.

## 2. Edit `channel.json`

Open `channel.json` and change `name` and `description`.

```json
{
  "name": "My Channel",
  "description": "Videos about things I love.",
  "logo": "assets/logo.png",
  "banner": "assets/banner.png"
}
```

## 3. Upload your logo and banner

Open the `assets` folder.

Replace `logo.png` with your own square image.

Replace `banner.png` with your own wide image.

JPG, PNG and WEBP all work. The best file names are `logo` and `banner`.

## 4. Upload a video with a release

Go to **Releases** > **Draft a new release**.

Type a tag, for example `video1`.

Attach your video in the box that says **Attach binaries by dropping them here
or selecting them**.

Do **not** paste the file into the description box.

Tap **Publish release**.

Now wait. Open the **Actions** tab. Wait for a green tick.

The Action makes a thumbnail, smaller video versions and a `media.json` file.

Do **not** edit `media.json` by hand.

## 5. Add the video to `videos.json`

On the release page, find your video under **Assets**.

Copy its link. It must contain `/releases/download/`.

Add the video to `videos.json`. Only three fields are needed:

```json
[
  {
    "title": "My first video",
    "description": "A short description.",
    "videoUrl": "https://github.com/USERNAME/REPO/releases/download/video1/my-video.mp4"
  }
]
```

OurTube fills in the rest for you.

## 6. Add the topic

On your repository page, tap the gear icon next to **About**.

Add the topic `openyoutube-channel`.

Save it.

## 7. Optional extras

**Captions:** put `captions/<video-id>.en.vtt` in the `captions` folder.

**Posts:** add short updates to `posts.json`.

**Custom thumbnail:** add `assets/<video-id>.jpg`.

**Want comments?** Open **Settings**, then **Features**, and turn on
**Discussions**. OurTube will show a "Discuss on GitHub" button.

## Troubleshooting

- **The video does not play.** The link must contain `/releases/download/`.
  A link with `/releases/tag/` will not play.
- **HEIC photos do not work.** Use JPG, PNG or WEBP.
- **The channel does not show up.** The topic must be exactly
  `openyoutube-channel`. The repository must be public.
- **The Action fails.** Go to **Settings** > **Actions** > **General** >
  **Workflow permissions** and choose **Read and write**.
- **Wait a few minutes.** OurTube caches channel data for five minutes.

## Files

```text
channel.json          Your channel name, description, logo and banner
videos.json           Your video list
posts.json            Your short posts
media.json            Made by the Action. Do not edit.
assets/               Logo, banner and thumbnails
captions/             Optional subtitle files
.github/workflows/    The Action that processes releases
```

## Never put video files inside the repository

GitHub rejects files over 100 MB in a repo. Use Releases instead.
