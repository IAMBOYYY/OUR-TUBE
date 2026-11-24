"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowUpRightIcon,
  FilmIcon,
  MusicIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from "@/components/icons";
import { VideoCard } from "@/components/video-card";
import { CHANNEL_TEMPLATE_URL, GITHUB_TOPIC_URL } from "@/lib/constants";
import type { VideoType, VideoWithChannel } from "@/lib/types";
import { matchesQuery, shuffle } from "@/lib/utils";

type Filter = "all" | VideoType;

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "video", label: "Videos" },
  { value: "music", label: "Music" },
];

type HomeFeedProps = {
  videos: VideoWithChannel[];
  initialQuery: string;
};

export function HomeFeed({ videos, initialQuery }: HomeFeedProps) {
  const [orderedVideos, setOrderedVideos] = useState(videos);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setOrderedVideos(shuffle(videos));
  }, [videos]);

  const counts = useMemo(
    () => ({
      all: videos.length,
      video: videos.filter((video) => video.type === "video").length,
      music: videos.filter((video) => video.type === "music").length,
    }),
    [videos],
  );

  const filteredVideos = useMemo(
    () =>
      orderedVideos.filter(
        (video) =>
          (filter === "all" || video.type === filter) &&
          matchesQuery(video, query),
      ),
    [orderedVideos, filter, query],
  );

  if (videos.length === 0) {
    return <EmptyFeed />;
  }

  const hasActiveFilters = query.trim().length > 0 || filter !== "all";

  function clearFilters() {
    setQuery("");
    setFilter("all");
  }

  return (
    <div>
      <div className="mb-8 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
            <label htmlFor="video-search" className="sr-only">
              Search by title, channel, or tag
            </label>
            <input
              id="video-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search videos, channels, or tags..."
              className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-11 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-card-hover hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div
            className="flex items-center gap-2 overflow-x-auto pb-1"
            aria-label="Filter videos"
          >
            {filters.map((item) => {
              const active = filter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  aria-pressed={active}
                  className={
                    active
                      ? "inline-flex shrink-0 items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-sm transition"
                      : "inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted transition hover:border-primary/30 hover:text-foreground"
                  }
                >
                  {item.value === "video" ? (
                    <FilmIcon className="h-4 w-4" />
                  ) : item.value === "music" ? (
                    <MusicIcon className="h-4 w-4" />
                  ) : (
                    <SparklesIcon className="h-4 w-4" />
                  )}
                  {item.label}
                  <span
                    className={
                      active
                        ? "text-background/60"
                        : "text-muted/60"
                    }
                  >
                    {counts[item.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {query.trim()
                ? `Results for “${query.trim()}”`
                : "Fresh from the community"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {filteredVideos.length}{" "}
              {filteredVideos.length === 1 ? "video" : "videos"} in view
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-primary transition hover:text-primary/80"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <NoResults onClear={clearFilters} />
      ) : (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video) => (
            <VideoCard
              key={`${video.owner}/${video.repo}/${video.id}`}
              video={video}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-500/15 to-amber-400/15 text-primary">
        <SparklesIcon className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-2xl font-bold tracking-tight">
        No channels discovered yet
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
        OUR TUBE finds channels through the{" "}
        <code className="rounded bg-background px-1.5 py-0.5 text-xs">
          openyoutube-channel
        </code>{" "}
        GitHub topic. Create a channel with the template, add the topic, and it
        will show up here after the next refresh.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={CHANNEL_TEMPLATE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
        >
          Use the channel template
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
        <Link
          href={GITHUB_TOPIC_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:border-primary/30 hover:text-primary"
        >
          Browse the topic
        </Link>
      </div>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-background text-muted">
        <SearchIcon className="h-7 w-7" />
      </span>
      <h3 className="mt-5 text-xl font-bold">Nothing matched that search</h3>
      <p className="mt-2 text-sm text-muted">
        Try a different title, channel name, or tag.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
      >
        Reset filters
      </button>
    </div>
  );
}
