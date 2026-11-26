export const SITE_NAME = "OurTube";
export const SITE_DESCRIPTION =
  "An open-source, community-powered video platform. Discover independent channels published through GitHub.";
export const SITE_REPO = "IAMBOYYY/OUR-TUBE";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://our-tube-nine.vercel.app";
export const GITHUB_URL = `https://github.com/${SITE_REPO}`;
export const CHANNEL_TEMPLATE_URL = `${GITHUB_URL}/tree/main/channel-template`;
export const CHANNEL_TOPIC = "openyoutube-channel";
export const GITHUB_TOPIC_URL = `https://github.com/topics/${CHANNEL_TOPIC}`;

export const SHORTS_MAX_SECONDS = 60;
export const CACHE_SECONDS = 300;

export const FOLLOWING_KEY = "ourtube:following";
export const LIKED_KEY = "ourtube:liked";
export const WATCH_LATER_KEY = "ourtube:watch-later";
export const HISTORY_KEY = "ourtube:history";
export const RECENT_SEARCHES_KEY = "ourtube:recent-searches";
export const PLAYER_QUALITY_KEY = "ourtube:player:quality";
export const PLAYER_CAPTIONS_KEY = "ourtube:player:captions";
export const PLAYER_SPEED_KEY = "ourtube:player:speed";
export const AUTOPLAY_NEXT_KEY = "ourtube:player:autoplay-next";

export const AUDIO_EXTENSIONS = [
  "mp3",
  "m4a",
  "ogg",
  "oga",
  "wav",
  "flac",
  "aac",
  "opus",
];

export const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif", "avif"];
