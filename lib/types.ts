export type VideoType = "video" | "music";

export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  videoUrl: string;
  type: VideoType;
  tags: string[];
  date: string;
  duration?: string;
};

export type Channel = {
  owner: string;
  repo: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  htmlUrl: string;
  defaultBranch: string;
  videos: Video[];
};

export type VideoWithChannel = Video & {
  owner: string;
  repo: string;
  channelName: string;
  channelLogo: string;
  channelHtmlUrl: string;
};
