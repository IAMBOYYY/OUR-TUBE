import type { VideoWithChannel } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function pickRandom<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}

export function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function matchesQuery(video: VideoWithChannel, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    video.title,
    video.channelName,
    video.owner,
    video.repo,
    ...video.tags,
  ].some((value) => value.toLowerCase().includes(normalized));
}

export function channelHref(owner: string, repo: string): string {
  return `/channel/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

export function watchHref(owner: string, repo: string, id: string): string {
  return `/watch/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(id)}`;
}
