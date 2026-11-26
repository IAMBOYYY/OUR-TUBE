import { z } from "zod";

import { isRepoBlocked, isVideoBlocked } from "@/lib/blocklist";
import {
  AUDIO_EXTENSIONS,
  CACHE_SECONDS,
  CHANNEL_TOPIC,
  IMAGE_EXTENSIONS,
  SHORTS_MAX_SECONDS,
} from "@/lib/constants";
import { getMp4Duration } from "@/lib/mp4-duration";
import type {
  Caption,
  Channel,
  Post,
  SiteData,
  SuggestionIndex,
  Video,
  VideoSource,
  VideoType,
  VideoWithChannel,
} from "@/lib/types";
import {
  fileBaseName,
  fileExtension,
  formatDuration,
  normalizeDate,
  parseDuration,
  shortHref,
  slugify,
} from "@/lib/utils";

const GITHUB_API = "https://api.github.com";
const RAW_BASE = "https://raw.githubusercontent.com";
const SEARCH_PER_PAGE = 100;
const MAX_SEARCH_PAGES = 5;
const CONCURRENCY = 6;

const repositorySchema = z.object({
  name: z.string().min(1),
  owner: z.object({ login: z.string().min(1) }),
  default_branch: z.string().min(1).default("main"),
  html_url: z.string().optional(),
  description: z.string().nullable().optional(),
  stargazers_count: z.number().optional().default(0),
  has_discussions: z.boolean().optional().default(false),
  created_at: z.string().optional(),
  pushed_at: z.string().optional(),
});

const repositorySearchSchema = z.object({
  items: z.array(repositorySchema),
});

const treeSchema = z.object({
  tree: z
    .array(z.object({ path: z.string(), type: z.string() }))
    .optional()
    .default([]),
});

const releaseAssetSchema = z.object({
  name: z.string(),
  size: z.number().optional().default(0),
  created_at: z.string().optional(),
  browser_download_url: z.string().optional(),
});

const releaseSchema = z.object({
  tag_name: z.string(),
  assets: z.array(releaseAssetSchema).optional().default([]),
});

const channelFileSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    logo: z.string().optional(),
    banner: z.string().optional(),
  })
  .passthrough();

const rawVideoSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(1),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    videoUrl: z.string().trim().min(1),
    type: z.string().optional(),
    tags: z.array(z.string()).optional(),
    date: z.string().optional(),
    duration: z.union([z.string(), z.number()]).optional(),
    captions: z
      .array(
        z.object({
          lang: z.string().trim().min(1),
          label: z.string().optional(),
          url: z.string().trim().min(1),
        }),
      )
      .optional(),
  })
  .passthrough();

const rawPostSchema = z
  .object({
    id: z.string().optional(),
    text: z.string().trim().min(1),
    image: z.string().optional(),
    date: z.string().optional(),
  })
  .passthrough();

const mediaSourceSchema = z.object({
  label: z.string().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  url: z.string().min(1),
});

const mediaEntrySchema = z.object({
  durationSeconds: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  thumbnail: z.string().optional(),
  sources: z.array(mediaSourceSchema).optional(),
});

const mediaFileSchema = z.object({
  files: z.record(z.string(), mediaEntrySchema).optional().default({}),
});

type RepositoryRef = {
  owner: string;
  repo: string;
  branch: string;
  htmlUrl: string;
  description: string;
  stars: number;
  hasDiscussions: boolean;
  createdAt: string;
  pushedAt: string;
};

type MediaEntry = z.infer<typeof mediaEntrySchema>;

type ReleaseAsset = {
  createdAt: string;
  size: number;
  url: string;
};

type TreeIndex = {
  available: boolean;
  paths: Map<string, string>;
  assetByBase: Map<string, string>;
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
  options: { silentNotFound?: boolean } = {},
): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: CACHE_SECONDS },
    });

    if (!response.ok) {
      if (!(options.silentNotFound && response.status === 404)) {
        logWarning(`Request failed (${response.status}) for ${url}`);
      }

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

function isAbsoluteUrl(value: string): boolean {
  return /^(https?:|data:|blob:)/i.test(value);
}

function normalizeRelative(value: string): string {
  return value.replace(/^\.?\//, "").replace(/^\/+/, "");
}

function resolveMaybeUrl(value: string, rawBase: string): string {
  if (isAbsoluteUrl(value)) {
    return value;
  }

  try {
    return new URL(normalizeRelative(value), rawBase).toString();
  } catch {
    return value;
  }
}

async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await mapper(items[index], index);
      }
    },
  );

  await Promise.all(workers);
  return results;
}

function toRepositoryRef(item: z.infer<typeof repositorySchema>): RepositoryRef {
  return {
    owner: item.owner.login,
    repo: item.name,
    branch: item.default_branch,
    htmlUrl:
      item.html_url ??
      `https://github.com/${item.owner.login}/${item.name}`,
    description: item.description ?? "",
    stars: item.stargazers_count ?? 0,
    hasDiscussions: item.has_discussions ?? false,
    createdAt: item.created_at ?? "",
    pushedAt: item.pushed_at ?? "",
  };
}

async function searchRepositories(): Promise<{
  repositories: RepositoryRef[];
  failed: boolean;
}> {
  const repositories: RepositoryRef[] = [];
  let failed = false;

  for (let page = 1; page <= MAX_SEARCH_PAGES; page += 1) {
    const url = new URL(`${GITHUB_API}/search/repositories`);
    url.searchParams.set("q", `topic:${CHANNEL_TOPIC} fork:false`);
    url.searchParams.set("per_page", String(SEARCH_PER_PAGE));
    url.searchParams.set("page", String(page));

    const data = await fetchJson(url.toString(), githubHeaders());

    if (data === null) {
      failed = true;
      break;
    }

    const parsed = repositorySearchSchema.safeParse(data);

    if (!parsed.success) {
      logWarning("GitHub search returned an unexpected response", parsed.error);
      failed = true;
      break;
    }

    for (const item of parsed.data.items) {
      const ref = toRepositoryRef(item);

      if (isRepoBlocked(ref.owner, ref.repo)) {
        continue;
      }

      repositories.push(ref);
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
    failed,
  };
}

function buildTreeIndex(data: unknown): TreeIndex {
  const paths = new Map<string, string>();
  const assetByBase = new Map<string, string>();
  const parsed = treeSchema.safeParse(data);

  if (!parsed.success) {
    return { available: false, paths, assetByBase };
  }

  for (const entry of parsed.data.tree) {
    if (entry.type !== "blob") {
      continue;
    }

    const lower = entry.path.toLowerCase();
    paths.set(lower, entry.path);

    if (!lower.startsWith("assets/")) {
      continue;
    }

    const extension = fileExtension(entry.path);

    if (!IMAGE_EXTENSIONS.includes(extension)) {
      continue;
    }

    const base = fileBaseName(entry.path).toLowerCase();
    const existing = assetByBase.get(base);

    if (!existing || entry.path.split("/").length < existing.split("/").length) {
      assetByBase.set(base, entry.path);
    }
  }

  return { available: true, paths, assetByBase };
}

function findAssetByBase(index: TreeIndex, base: string): string | null {
  const normalized = base.toLowerCase();

  for (const extension of IMAGE_EXTENSIONS) {
    const root = `assets/${normalized}.${extension}`;
    const rootActual = index.paths.get(root);

    if (rootActual) {
      return rootActual;
    }

    const nested = `assets/thumbnails/${normalized}.${extension}`;
    const nestedActual = index.paths.get(nested);

    if (nestedActual) {
      return nestedActual;
    }
  }

  return index.assetByBase.get(normalized) ?? null;
}

function resolveAsset(
  declared: string | undefined,
  index: TreeIndex,
  rawBase: string,
): string | null {
  if (!declared) {
    return null;
  }

  if (isAbsoluteUrl(declared)) {
    return declared;
  }

  const clean = normalizeRelative(declared);

  if (!index.available) {
    return resolveMaybeUrl(clean, rawBase);
  }

  const actual = index.paths.get(clean.toLowerCase());

  if (actual) {
    return resolveMaybeUrl(actual, rawBase);
  }

  const candidate = findAssetByBase(index, fileBaseName(clean));

  if (candidate) {
    return resolveMaybeUrl(candidate, rawBase);
  }

  return null;
}

function parseReleaseAsset(
  videoUrl: string,
): { tag: string; file: string; key: string } | null {
  try {
    const url = new URL(videoUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const downloadIndex = parts.indexOf("download");

    if (
      downloadIndex < 2 ||
      parts[downloadIndex - 2] !== "releases" ||
      parts.length < downloadIndex + 3
    ) {
      return null;
    }

    const tag = decodeURIComponent(parts[downloadIndex + 1] ?? "");
    const file = decodeURIComponent(parts.slice(downloadIndex + 2).join("/"));

    if (!tag || !file) {
      return null;
    }

    return { tag, file, key: `${tag}/${file}` };
  } catch {
    return null;
  }
}

function buildReleaseMap(data: unknown): Map<string, ReleaseAsset> {
  const map = new Map<string, ReleaseAsset>();
  const parsed = z.array(releaseSchema).safeParse(data);

  if (!parsed.success) {
    return map;
  }

  for (const release of parsed.data) {
    for (const asset of release.assets) {
      map.set(`${release.tag_name}/${asset.name}`.toLowerCase(), {
        createdAt: asset.created_at ?? "",
        size: asset.size ?? 0,
        url: asset.browser_download_url ?? "",
      });
    }
  }

  return map;
}

function buildMediaMap(data: unknown): Map<string, MediaEntry> {
  const map = new Map<string, MediaEntry>();
  const parsed = mediaFileSchema.safeParse(data);

  if (!parsed.success) {
    return map;
  }

  for (const [key, entry] of Object.entries(parsed.data.files)) {
    map.set(key.toLowerCase(), entry);
    const file = key.split("/").slice(1).join("/");

    if (file) {
      map.set(file.toLowerCase(), entry);
    }
  }

  return map;
}

function languageLabel(lang: string): string {
  try {
    const display = new Intl.DisplayNames(["en"], { type: "language" });
    return display.of(lang) ?? lang;
  } catch {
    return lang;
  }
}

function collectCaptions(
  id: string,
  declared: z.infer<typeof rawVideoSchema>["captions"],
  index: TreeIndex,
  rawBase: string,
): Caption[] {
  const captions: Caption[] = [];
  const seen = new Set<string>();

  function add(lang: string, label: string, url: string) {
    const key = `${lang.toLowerCase()}::${url}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    captions.push({ lang, label, url });
  }

  if (index.available) {
    for (const [lower, actual] of index.paths) {
      if (!lower.startsWith("captions/")) {
        continue;
      }

      const name = actual.slice("captions/".length);
      const match = name.match(/^(.*)\.([a-zA-Z0-9-]+)\.(vtt|srt)$/i);

      if (!match || match[1].toLowerCase() !== id.toLowerCase()) {
        continue;
      }

      const lang = match[2].toLowerCase();
      add(lang, languageLabel(lang), resolveMaybeUrl(actual, rawBase));
    }
  }

  for (const item of declared ?? []) {
    const lang = item.lang.toLowerCase();
    add(lang, item.label?.trim() || languageLabel(lang), resolveMaybeUrl(item.url, rawBase));
  }

  return captions;
}

function shorterSide(source: z.infer<typeof mediaSourceSchema>): number | undefined {
  if (source.width && source.height) {
    return Math.min(source.width, source.height);
  }

  return source.height ?? source.width;
}

function buildSources(
  entry: MediaEntry | undefined,
  rawBase: string,
): VideoSource[] | undefined {
  if (!entry?.sources || entry.sources.length === 0) {
    return undefined;
  }

  return entry.sources
    .map((source) => {
      const side = shorterSide(source);
      return {
        label: side ? `${side}p` : source.label?.trim() || "Original",
        height: side,
        url: resolveMaybeUrl(source.url, rawBase),
      };
    })
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
}

function hashText(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash).toString(36);
}

async function loadChannel(ref: RepositoryRef): Promise<Channel | null> {
  if (isRepoBlocked(ref.owner, ref.repo)) {
    return null;
  }

  const rawBase = `${RAW_BASE}/${encodeURIComponent(ref.owner)}/${encodeURIComponent(
    ref.repo,
  )}/${encodePath(ref.branch)}/`;

  const [channelData, videosData, postsData, mediaData, treeData, releasesData] =
    await Promise.all([
      fetchJson(`${rawBase}channel.json`, undefined, { silentNotFound: true }),
      fetchJson(`${rawBase}videos.json`, undefined, { silentNotFound: true }),
      fetchJson(`${rawBase}posts.json`, undefined, { silentNotFound: true }),
      fetchJson(`${rawBase}media.json`, undefined, { silentNotFound: true }),
      fetchJson(
        `${GITHUB_API}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(
          ref.repo,
        )}/git/trees/${encodeURIComponent(ref.branch)}?recursive=1`,
        githubHeaders(),
      ),
      fetchJson(
        `${GITHUB_API}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(
          ref.repo,
        )}/releases?per_page=100`,
        githubHeaders(),
      ),
    ]);

  const channelResult = channelFileSchema.safeParse(channelData ?? {});
  const channelInfo = channelResult.success ? channelResult.data : {};
  const index = buildTreeIndex(treeData);
  const releases = buildReleaseMap(releasesData);
  const media = buildMediaMap(mediaData);

  const name = channelInfo.name?.trim() || ref.repo;
  const description = channelInfo.description ?? ref.description ?? "";
  const logo =
    resolveAsset(channelInfo.logo, index, rawBase) ??
    (findAssetByBase(index, "logo")
      ? resolveMaybeUrl(findAssetByBase(index, "logo") as string, rawBase)
      : `https://github.com/${encodeURIComponent(ref.owner)}.png`);
  const banner =
    resolveAsset(channelInfo.banner, index, rawBase) ??
    (findAssetByBase(index, "banner")
      ? resolveMaybeUrl(findAssetByBase(index, "banner") as string, rawBase)
      : undefined);

  const rawVideos = Array.isArray(videosData) ? videosData : [];
  const videos = await mapWithLimit(rawVideos, CONCURRENCY, async (item) => {
    const parsed = rawVideoSchema.safeParse(item);

    if (!parsed.success) {
      logWarning(
        `Skipping a video in ${ref.owner}/${ref.repo}`,
        parsed.error,
      );
      return null;
    }

    const raw = parsed.data;
    const id =
      raw.id?.trim() ||
      slugify(fileBaseName(raw.videoUrl)) ||
      `video-${hashText(raw.title)}`;

    if (isVideoBlocked(ref.owner, ref.repo, id)) {
      return null;
    }

    const release = parseReleaseAsset(raw.videoUrl);
    const asset = release
      ? releases.get(release.key.toLowerCase())
      : undefined;
    const extension = fileExtension(raw.videoUrl);
    const type: VideoType =
      raw.type === "music" || raw.type === "video"
        ? raw.type
        : AUDIO_EXTENSIONS.includes(extension)
          ? "music"
          : "video";
    const mediaEntry = release
      ? media.get(release.key.toLowerCase()) ??
        media.get(release.file.toLowerCase())
      : undefined;
    const videoUrl = resolveMaybeUrl(raw.videoUrl, rawBase);

    const date =
      normalizeDate(raw.date) ??
      normalizeDate(asset?.createdAt) ??
      normalizeDate(ref.pushedAt) ??
      "";

    const declaredThumbnail = resolveAsset(raw.thumbnail, index, rawBase);
    const thumbnail =
      declaredThumbnail ??
      (findAssetByBase(index, id)
        ? resolveMaybeUrl(findAssetByBase(index, id) as string, rawBase)
        : undefined) ??
      (mediaEntry?.thumbnail
        ? resolveMaybeUrl(mediaEntry.thumbnail, rawBase)
        : undefined);

    const mediaDuration =
      typeof mediaEntry?.durationSeconds === "number" &&
      mediaEntry.durationSeconds > 0
        ? mediaEntry.durationSeconds
        : null;
    const headerDuration = mediaDuration ?? (await getMp4Duration(videoUrl));
    const manualSeconds = parseDuration(raw.duration);
    const durationSeconds =
      mediaDuration ?? headerDuration ?? manualSeconds ?? undefined;

    const duration =
      typeof durationSeconds === "number"
        ? formatDuration(durationSeconds)
        : typeof raw.duration === "string"
          ? raw.duration
          : typeof raw.duration === "number"
            ? formatDuration(raw.duration)
            : undefined;

    const video: Video = {
      id,
      title: raw.title,
      description: raw.description ?? "",
      thumbnail,
      videoUrl,
      type,
      tags: raw.tags ?? [],
      date,
      duration,
      durationSeconds: durationSeconds ?? undefined,
      isShort:
        type === "video" &&
        typeof durationSeconds === "number" &&
        Math.round(durationSeconds) <= SHORTS_MAX_SECONDS,
      size: asset?.size || undefined,
      sources: buildSources(mediaEntry, rawBase),
      captions: collectCaptions(id, raw.captions, index, rawBase),
    };

    return video;
  });

  const validVideos = videos.filter((video): video is Video => video !== null);
  validVideos.sort((a, b) => {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();
    return (Number.isFinite(second) ? second : 0) - (Number.isFinite(first) ? first : 0);
  });

  const rawPosts = Array.isArray(postsData) ? postsData : [];
  const posts: Post[] = [];

  for (let postIndex = 0; postIndex < rawPosts.length; postIndex += 1) {
    const parsed = rawPostSchema.safeParse(rawPosts[postIndex]);

    if (!parsed.success) {
      logWarning(`Skipping a post in ${ref.owner}/${ref.repo}`, parsed.error);
      continue;
    }

    const raw = parsed.data;
    const id =
      raw.id?.trim() ||
      `post-${postIndex + 1}-${hashText(raw.text)}`;
    const image = resolveAsset(raw.image, index, rawBase) ?? undefined;
    const date =
      normalizeDate(raw.date) ??
      normalizeDate(ref.pushedAt) ??
      "";

    posts.push({
      id,
      text: raw.text,
      image,
      date,
      owner: ref.owner,
      repo: ref.repo,
      channelName: name,
      channelLogo: logo,
      channelHtmlUrl: ref.htmlUrl,
      hasDiscussions: ref.hasDiscussions,
    });
  }

  posts.sort((a, b) => {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();
    return (Number.isFinite(second) ? second : 0) - (Number.isFinite(first) ? first : 0);
  });

  return {
    owner: ref.owner,
    repo: ref.repo,
    name,
    description,
    logo,
    banner,
    htmlUrl: ref.htmlUrl,
    defaultBranch: ref.branch,
    stars: ref.stars,
    hasDiscussions: ref.hasDiscussions,
    createdAt: ref.createdAt,
    pushedAt: ref.pushedAt,
    videos: validVideos,
    posts,
  };
}

async function loadChannels(repositories: RepositoryRef[]): Promise<Channel[]> {
  if (repositories.length === 0) {
    return [];
  }

  const channels = await mapWithLimit(
    repositories,
    CONCURRENCY,
    async (repository) => {
      try {
        return await loadChannel(repository);
      } catch (error) {
        logWarning(
          `Skipping channel ${repository.owner}/${repository.repo}`,
          error,
        );
        return null;
      }
    },
  );

  return channels.filter((channel): channel is Channel => channel !== null);
}

type SiteLoad = {
  channels: Channel[];
  failed: boolean;
  at: number;
};

let siteCache: SiteLoad | null = null;
let sitePromise: Promise<SiteLoad> | null = null;

async function loadSite(): Promise<SiteLoad> {
  if (siteCache && Date.now() - siteCache.at < CACHE_SECONDS * 1000) {
    return siteCache;
  }

  if (sitePromise) {
    return sitePromise;
  }

  sitePromise = (async () => {
    const { repositories, failed } = await searchRepositories();
    const channels = await loadChannels(repositories);
    const result: SiteLoad = { channels, failed, at: Date.now() };

    if (!failed || channels.length > 0) {
      siteCache = result;
    }

    return result;
  })();

  try {
    return await sitePromise;
  } finally {
    sitePromise = null;
  }
}

function flattenVideos(channels: Channel[]): VideoWithChannel[] {
  return channels
    .flatMap((channel) =>
      channel.videos.map((video) => ({
        ...video,
        owner: channel.owner,
        repo: channel.repo,
        channelName: channel.name,
        channelLogo: channel.logo,
        channelHtmlUrl: channel.htmlUrl,
        hasDiscussions: channel.hasDiscussions,
        stars: channel.stars,
      })),
    )
    .sort((a, b) => {
      const first = new Date(a.date).getTime();
      const second = new Date(b.date).getTime();
      return (Number.isFinite(second) ? second : 0) - (Number.isFinite(first) ? first : 0);
    });
}

export async function getSiteData(): Promise<SiteData> {
  const { channels, failed } = await loadSite();
  const videos = flattenVideos(channels);

  return {
    channels,
    videos,
    shorts: videos.filter((video) => video.isShort),
    music: videos.filter((video) => video.type === "music"),
    posts: channels
      .flatMap((channel) => channel.posts)
      .sort((a, b) => {
        const first = new Date(a.date).getTime();
        const second = new Date(b.date).getTime();
        return (Number.isFinite(second) ? second : 0) - (Number.isFinite(first) ? first : 0);
      }),
    failed,
  };
}

export async function getChannels(): Promise<Channel[]> {
  const { channels } = await loadSite();
  return channels;
}

export async function getAllVideosResult(): Promise<{
  videos: VideoWithChannel[];
  failed: boolean;
}> {
  const { channels, failed } = await loadSite();
  return { videos: flattenVideos(channels), failed };
}

export async function getAllVideos(): Promise<VideoWithChannel[]> {
  const { videos } = await getAllVideosResult();
  return videos;
}

export async function getChannel(
  owner: string,
  repo: string,
): Promise<Channel | null> {
  if (!owner || !repo) {
    return null;
  }

  if (isRepoBlocked(owner, repo)) {
    return null;
  }

  const cached = siteCache?.channels.find(
    (channel) =>
      channel.owner.toLowerCase() === owner.toLowerCase() &&
      channel.repo.toLowerCase() === repo.toLowerCase(),
  );

  if (cached) {
    return cached;
  }

  const data = await fetchJson(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    githubHeaders(),
  );
  const parsed = repositorySchema.safeParse(data);

  if (!parsed.success) {
    return null;
  }

  return loadChannel(toRepositoryRef(parsed.data));
}

export async function getSuggestionIndex(): Promise<SuggestionIndex> {
  const { channels, videos } = await getSiteData();
  const titles: SuggestionIndex["titles"] = [];
  const seenTitles = new Set<string>();

  for (const video of videos) {
    const label = video.title;

    if (seenTitles.has(label)) {
      continue;
    }

    seenTitles.add(label);
    titles.push({
      label,
      href: video.isShort
        ? shortHref(video.owner, video.repo, video.id)
        : `/watch/${encodeURIComponent(video.owner)}/${encodeURIComponent(
            video.repo,
          )}/${encodeURIComponent(video.id)}`,
    });
  }

  const tags = new Set<string>();

  for (const video of videos) {
    for (const tag of video.tags) {
      tags.add(tag);
    }
  }

  return {
    titles: titles.slice(0, 200),
    channels: channels.map((channel) => ({
      label: channel.name,
      owner: channel.owner,
      href: `/channel/${encodeURIComponent(channel.owner)}/${encodeURIComponent(
        channel.repo,
      )}`,
    })),
    tags: Array.from(tags).slice(0, 200),
  };
}
