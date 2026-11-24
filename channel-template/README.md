# OurTube channel template

Use this folder as the starting point for a channel that appears on OurTube.

![Placeholder channel banner](assets/banner.png)

## Create your channel

1. Copy this folder into a new public GitHub repository, or use the OurTube repository as a GitHub template if that option is enabled.
2. Rename the channel in `channel.json` and replace `assets/logo.png` and `assets/banner.png`.
3. Add your videos to `videos.json` and add thumbnail images to `assets/` if you want custom thumbnails.
4. Host the actual video and audio files outside the repository (see below).
5. Add the topic **`openyoutube-channel`** to your repository. OurTube discovers channels through this GitHub topic.
6. Make sure the repository is public and that `channel.json` and `videos.json` are valid JSON on the default branch.

Discovery is cached for five minutes. Your channel should appear after the next refresh.

## Files

```text
channel-template/
├── channel.json
├── videos.json
├── assets/
│   ├── logo.png
│   ├── banner.png
│   └── thumbnail.png
└── README.md
```

### `channel.json`

```json
{
  "name": "Open Studio",
  "description": "A short description of your channel.",
  "logo": "assets/logo.png",
  "banner": "assets/banner.png"
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `name` | Yes | Channel name shown across the app. |
| `description` | Yes | Plain text. Empty strings are allowed. |
| `logo` | Yes | Absolute URL or a path relative to the repository. |
| `banner` | Yes | Absolute URL or a path relative to the repository. |

### `videos.json`

```json
[
  {
    "id": "unique-video-id",
    "title": "Video title",
    "description": "A description of the video.",
    "thumbnail": "assets/thumbnail.png",
    "videoUrl": "https://example.com/video.mp4",
    "type": "video",
    "tags": ["open source", "tutorial"],
    "date": "2026-01-15",
    "duration": "12:04"
  }
]
```

| Field | Required | Notes |
| --- | --- | --- |
| `id` | Yes | Unique within the channel. Used in the watch URL. |
| `title` | Yes | Video title. |
| `description` | Yes | Plain text. |
| `thumbnail` | No | Full URL or a path relative to the repository. If omitted or broken, the app tries the first frame of the video. |
| `videoUrl` | Yes | Direct URL to an MP4/WebM file, or an MP3 for music. |
| `type` | Yes | `"video"` or `"music"`. Music uses the audio player. |
| `tags` | Yes | Array of strings. Used by search. |
| `date` | Yes | Any date string, ideally ISO `YYYY-MM-DD`. |
| `duration` | No | Text shown in the thumbnail corner, for example `"12:04"`. |

Relative asset paths such as `assets/logo.png` or `assets/thumbnail.png` are resolved against your repository's default branch on `raw.githubusercontent.com`.

## Add a thumbnail

1. Put the image in the `assets/` folder, for example `assets/my-video.jpg`.
2. Set the video's `thumbnail` field to `"assets/my-video.jpg"`.
3. Use a 16:9 image, ideally 1280×720 or larger.

You can also use a full URL. If a thumbnail is missing or fails to load, OurTube falls back to the first frame of the video, then to a gray placeholder. The optional `duration` field is displayed on the thumbnail.

## Host your media outside the repo

Never commit video or audio files to your channel repository. Git repositories are not a CDN, and large files make clones slow.

Recommended options:

- **GitHub Releases** — create a release and upload the media as release assets, then use the public asset URLs. Release assets support large files and range requests.
- **Cloudflare R2** — upload to a bucket, connect a custom domain or public bucket URL, and use those URLs. Enable CORS and range requests if you serve media from a custom domain.

Use direct file URLs that end in `.mp4`, `.webm`, or `.mp3`. A link to a YouTube or Vimeo page will not work with the HTML5 player.

The sample videos in this template use public demo files. Replace them with your own media.

## Validation rules

OurTube validates both files with Zod. Repositories with missing, invalid, or malformed JSON are skipped without breaking the rest of the discovery feed. Keep IDs unique and use only `video` or `music` for the `type` field.

## Get listed

1. Push the files to the default branch of a public repository.
2. Open the repository's **About** settings.
3. Add the topic `openyoutube-channel`.
4. Search the topic on GitHub to confirm it is listed: <https://github.com/topics/openyoutube-channel>.

To remove your channel from OurTube, remove the topic from your repository.
