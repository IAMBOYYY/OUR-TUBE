import { SITE_REPO } from "@/lib/constants";

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

export function formatMonthYear(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
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

export function formatCount(value: number | undefined | null): string {
  const count = Number(value);

  if (!Number.isFinite(count) || count <= 0) {
    return "0";
  }

  if (count < 1_000) {
    return String(Math.floor(count));
  }

  const units = [
    { value: 1_000_000_000, suffix: "B" },
    { value: 1_000_000, suffix: "M" },
    { value: 1_000, suffix: "K" },
  ];

  for (const unit of units) {
    if (count >= unit.value) {
      const scaled = count / unit.value;
      const rounded =
        scaled >= 100
          ? Math.round(scaled)
          : Math.round(scaled * 10) / 10;
      return `${rounded}${unit.suffix}`;
    }
  }

  return String(Math.floor(count));
}

export function formatSubscribers(count: number | undefined | null): string {
  return `${formatCount(count)} ${Number(count) === 1 ? "subscriber" : "subscribers"}`;
}

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "";
  }

  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function parseDuration(value: string | number | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }

  const parts = trimmed.split(":").map((part) => Number(part));

  if (parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return null;
}

export function normalizeDate(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (!match) {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString();
  }

  const [, year, month, day] = match;
  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  const parsed = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber));

  if (
    parsed.getUTCFullYear() !== yearNumber ||
    parsed.getUTCMonth() !== monthNumber - 1 ||
    parsed.getUTCDate() !== dayNumber
  ) {
    return null;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function fileExtension(value: string): string {
  const clean = value.split(/[?#]/)[0] ?? value;
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : "";
}

export function fileBaseName(value: string): string {
  const clean = value.split(/[?#]/)[0] ?? value;
  const name = clean.split("/").pop() ?? clean;
  return name.replace(/\.[^.]+$/, "");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function channelHref(owner: string, repo: string): string {
  return `/channel/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

export function watchHref(owner: string, repo: string, id: string): string {
  return `/watch/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(id)}`;
}

export function shortHref(owner: string, repo: string, id: string): string {
  return `/shorts/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(id)}`;
}

export function videoKey(owner: string, repo: string, id: string): string {
  return `${owner}/${repo}/${id}`;
}

export function githubRepoUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}

export function discussionsUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}/discussions`;
}

export function reportIssueUrl(owner: string, repo: string, id: string): string {
  const title = `Report: ${owner}/${repo}/${id}`;
  const body = [
    `Channel: ${owner}/${repo}`,
    `Video: ${id}`,
    "",
    "What is wrong?",
    "",
  ].join("\n");

  return `https://github.com/${SITE_REPO}/issues/new?title=${encodeURIComponent(
    title,
  )}&body=${encodeURIComponent(body)}`;
}
