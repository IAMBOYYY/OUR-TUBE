export type VideoType = "video" | "music";

export type Caption = {
  lang: string;
  label: string;
  url: string;
};

export type VideoSource = {
  label: string;
  height?: number;
  url: string;
};

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
  durationSeconds?: number;
  isShort?: boolean;
  size?: number;
  sources?: VideoSource[];
  captions?: Caption[];
};

export type Post = {
  id: string;
  text: string;
  image?: string;
  date: string;
  owner: string;
  repo: string;
  channelName: string;
  channelLogo: string;
  channelHtmlUrl: string;
  hasDiscussions: boolean;
};

export type Channel = {
  owner: string;
  repo: string;
  name: string;
  description: string;
  logo: string;
  banner?: string;
  htmlUrl: string;
  defaultBranch: string;
  stars: number;
  hasDiscussions: boolean;
  createdAt: string;
  pushedAt: string;
  videos: Video[];
  posts: Post[];
};

export type VideoWithChannel = Video & {
  owner: string;
  repo: string;
  channelName: string;
  channelLogo: string;
  channelHtmlUrl: string;
  hasDiscussions: boolean;
  stars: number;
};

export type SiteData = {
  channels: Channel[];
  videos: VideoWithChannel[];
  shorts: VideoWithChannel[];
  music: VideoWithChannel[];
  posts: Post[];
  failed: boolean;
};

export type SearchResults = {
  videos: VideoWithChannel[];
  shorts: VideoWithChannel[];
  channels: Channel[];
  posts: Post[];
};

export type SuggestionIndex = {
  titles: Array<{ label: string; href: string }>;
  channels: Array<{ label: string; href: string; owner: string }>;
  tags: string[];
};
