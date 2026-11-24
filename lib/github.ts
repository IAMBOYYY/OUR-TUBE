import { z } from "zod";

import type { Channel, Video, VideoWithChannel } from "@/lib/types";

const CACHE_SECONDS = 300;
const SEARCH_PER_PAGE = 100;
const MAX_SEARCH_PAGES = 5;
const GITHUB_API = "https://api.github.com";
const RAW_BASE = "https://raw.githubusercontent.com";

const channelFileSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().default(""),
  logo: z.string().trim().min(1),
  banner: z.string().trim().min(1),
});

const videoSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().default(""),
  thumbnail: z.string().trim().min(1).optional(),
  videoUrl: z.string().trim().min(1),
  type: z.enum(["video", "music"]),
  tags: z.array(z.string()).default([]),
  date: z.string().trim().min(1),
  duration: z.string().trim().min(1).optional(),
});

const videosFileSchema = z.array(videoSchema);

const repositorySearchSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().min(1),
      owner: z.object({ login: z.string().min(1) }),
      default_branch: z.string().min(1).default("main"),
      html_url: z.string().optional(),
    }),
  ),
});

const repositorySchema = z.object({
  name: z.string().min(1),
  owner: z.object({ login: z.string().min(1) }),
  default_branch: z.string().min(1).default("main"),
  html_url: z.string().optional(),
});

type RepositoryRef = {
  owner: string;
  repo: string;
  branch: string;
  htmlUrl: string;
};

type RepositorySearchResult = {
  repositories: RepositoryRef[];
  failed: boolean;
};

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "our-tube",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

function logWarning(message: string, error?: unknown) {
  const detail = error instanceof Error ? error.message : error;
  console.warn(`[our-tube] ${message}`, detail ?? "");
}

async function fetchJson(
  url: string,
  headers: HeadersInit = { Accept: "application/json" },
): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!response.ok) {
      logWarning(`Request failed (${response.status}) for ${url}`);
      return null;
    }

    return (await response.json()) as unknown;
  } catch (error) {
    logWarning(`Request failed for ${url}`, error);
    return null;
  }
}

function encodePath(value: string): string {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function resolveRepoUrl(value: string, rawBase: string): string {
  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  try {
    return new URL(value, rawBase).toString();
  } catch {
    return value;
  }
}

async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await mapper(items[index]);
      }
    },
  );

  await Promise.all(workers);
  return results;
}

async function searchRepositories(): Promise<RepositorySearchResult> {
  const repositories: RepositoryRef[] = [];

  for (let page = 1; page <= MAX_SEARCH_PAGES; page += 1) {
    const url = new URL(`${GITHUB_API}/search/repositories`);
    url.searchParams.set("q", "topic:openyoutube-channel");
    url.searchParams.set("per_page", String(SEARCH_PER_PAGE));
    url.searchParams.set("page", String(page));

    const data = await fetchJson(url.toString(), githubHeaders());

    if (data === null) {
      return { repositories, failed: true };
    }

    const parsed = repositorySearchSchema.safeParse(data);

    if (!parsed.success) {
      logWarning("GitHub search returned an unexpected response", parsed.error);
      return { repositories, failed: true };
    }

    for (const item of parsed.data.items) {
      repositories.push({
        owner: item.owner.login,
        repo: item.name,
        branch: item.default_branch,
        htmlUrl: item.html_url ?? `https://github.com/${item.owner.login}/${item.name}`,
      });
    }

    if (parsed.data.items.length < SEARCH_PER_PAGE) {
      break;
    }
  }

  const seen = new Set<string>();

  return {
    repositories: repositories.filter((repository) => {
      const key = `${repository.owner}/${repository.repo}`.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    }),
    failed: false,
  };
}

async function loadChannel(
  owner: string,
  repo: string,
  branch: string,
  htmlUrl: string,
): Promise<Channel | null> {
  const rawBase = `${RAW_BASE}/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo,
  )}/${encodePath(branch)}/`;

  const [channelData, videosData] = await Promise.all([
    fetchJson(`${rawBase}channel.json`),
    fetchJson(`${rawBase}videos.json`),
  ]);

  if (channelData === null || videosData === null) {
    return null;
  }

  const channelResult = channelFileSchema.safeParse(channelData);
  const videosResult = videosFileSchema.safeParse(videosData);

  if (!channelResult.success || !videosResult.success) {
    logWarning(
      `Skipping ${owner}/${repo}: invalid channel or video data`,
      channelResult.success ? videosResult.error : channelResult.error,
    );
    return null;
  }

  const videos: Video[] = videosResult.data.map((video) => ({
    ...video,
    thumbnail: video.thumbnail
      ? resolveRepoUrl(video.thumbnail, rawBase)
      : undefined,
    videoUrl: resolveRepoUrl(video.videoUrl, rawBase),
  }));

  return {
    owner,
    repo,
    name: channelResult.data.name,
    description: channelResult.data.description,
    logo: resolveRepoUrl(channelResult.data.logo, rawBase),
    banner: resolveRepoUrl(channelResult.data.banner, rawBase),
    htmlUrl,
    defaultBranch: branch,
    videos,
  };
}

async function loadChannels(repositories: RepositoryRef[]): Promise<Channel[]> {
  if (repositories.length === 0) {
    return [];
  }

  const channels = await mapWithLimit(repositories, 8, (repository) =>
    loadChannel(
      repository.owner,
      repository.repo,
      repository.branch,
      repository.htmlUrl,
    ),
  );

  return channels.filter((channel): channel is Channel => channel !== null);
}

function flattenVideos(channels: Channel[]): VideoWithChannel[] {
  return channels.flatMap((channel) =>
    channel.videos.map((video) => ({
      ...video,
      owner: channel.owner,
      repo: channel.repo,
      channelName: channel.name,
      channelLogo: channel.logo,
      channelHtmlUrl: channel.htmlUrl,
    })),
  );
}

export async function getChannels(): Promise<Channel[]> {
  const { repositories } = await searchRepositories();
  return loadChannels(repositories);
}

export async function getAllVideosResult(): Promise<{
  videos: VideoWithChannel[];
  failed: boolean;
}> {
  const { repositories, failed } = await searchRepositories();

  if (failed) {
    return { videos: [], failed: true };
  }

  const channels = await loadChannels(repositories);
  return { videos: flattenVideos(channels), failed: false };
}

export async function getChannel(
  owner: string,
  repo: string,
): Promise<Channel | null> {
  if (!owner || !repo) {
    return null;
  }

  const data = await fetchJson(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    githubHeaders(),
  );
  const parsed = repositorySchema.safeParse(data);

  if (!parsed.success) {
    return null;
  }

  return loadChannel(
    owner,
    repo,
    parsed.data.default_branch,
    parsed.data.html_url ?? `https://github.com/${owner}/${repo}`,
  );
}

export async function getAllVideos(): Promise<VideoWithChannel[]> {
  const { videos } = await getAllVideosResult();
  return videos;
}
