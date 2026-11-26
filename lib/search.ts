import type { SearchResults, SiteData, SuggestionIndex } from "@/lib/types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matches(values: string[], query: string): boolean {
  return values.some((value) => value.toLowerCase().includes(query));
}

export function searchSiteData(data: SiteData, rawQuery: string): SearchResults {
  const query = normalize(rawQuery);

  if (!query) {
    return {
      videos: data.videos,
      shorts: data.shorts,
      channels: data.channels,
      posts: data.posts,
    };
  }

  return {
    videos: data.videos.filter((video) =>
      matches(
        [
          video.title,
          video.description,
          video.channelName,
          video.owner,
          video.repo,
          ...video.tags,
        ],
        query,
      ),
    ),
    shorts: data.shorts.filter((video) =>
      matches(
        [
          video.title,
          video.description,
          video.channelName,
          video.owner,
          video.repo,
          ...video.tags,
        ],
        query,
      ),
    ),
    channels: data.channels.filter((channel) =>
      matches(
        [channel.name, channel.owner, channel.repo, channel.description],
        query,
      ),
    ),
    posts: data.posts.filter((post) =>
      matches([post.text, post.channelName, post.owner, post.repo], query),
    ),
  };
}

export type Suggestion = {
  label: string;
  href: string;
  kind: "video" | "channel" | "tag";
};

export function getSuggestions(
  index: SuggestionIndex,
  rawQuery: string,
  limit = 8,
): Suggestion[] {
  const query = normalize(rawQuery);

  if (!query) {
    return [];
  }

  const results: Suggestion[] = [];
  const seen = new Set<string>();

  function add(item: Suggestion) {
    const key = `${item.kind}:${item.label.toLowerCase()}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    results.push(item);
  }

  for (const channel of index.channels) {
    if (channel.label.toLowerCase().includes(query) || channel.owner.toLowerCase().includes(query)) {
      add({ label: channel.label, href: channel.href, kind: "channel" });
    }
  }

  for (const title of index.titles) {
    if (title.label.toLowerCase().includes(query)) {
      add({ label: title.label, href: title.href, kind: "video" });
    }
  }

  for (const tag of index.tags) {
    if (tag.toLowerCase().includes(query)) {
      add({
        label: `#${tag}`,
        href: `/results?q=${encodeURIComponent(tag)}`,
        kind: "tag",
      });
    }
  }

  return results.slice(0, limit);
}
