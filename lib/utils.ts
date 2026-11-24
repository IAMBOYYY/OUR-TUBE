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

export function formatRelativeDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const difference = date.getTime() - Date.now();
  const absolute = Math.abs(difference);

  if (absolute < 60_000) {
    return "just now";
  }

  const units: Array<{
    limit: number;
    divisor: number;
    unit: Intl.RelativeTimeFormatUnit;
  }> = [
    { limit: 60 * 60 * 1000, divisor: 60 * 1000, unit: "minute" },
    { limit: 24 * 60 * 60 * 1000, divisor: 60 * 60 * 1000, unit: "hour" },
    { limit: 7 * 24 * 60 * 60 * 1000, divisor: 24 * 60 * 60 * 1000, unit: "day" },
    {
      limit: 30 * 24 * 60 * 60 * 1000,
      divisor: 7 * 24 * 60 * 60 * 1000,
      unit: "week",
    },
    {
      limit: 365 * 24 * 60 * 60 * 1000,
      divisor: 30 * 24 * 60 * 60 * 1000,
      unit: "month",
    },
    {
      limit: Number.POSITIVE_INFINITY,
      divisor: 365 * 24 * 60 * 60 * 1000,
      unit: "year",
    },
  ];

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "always",
  });
  const matched =
    units.find((item) => absolute < item.limit) ?? units[units.length - 1];

  return formatter.format(
    Math.round(difference / matched.divisor),
    matched.unit,
  );
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
