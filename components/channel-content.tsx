"use client";

import { Clapperboard, FileText, Info, PlaySquare, VideoOff } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { MediaImage } from "@/components/media-image";
import { PostCard } from "@/components/post-card";
import { VideoCard } from "@/components/video-card";
import type { Channel, VideoWithChannel } from "@/lib/types";
import {
  cn,
  formatCount,
  formatMonthYear,
  formatSubscribers,
  shortHref,
} from "@/lib/utils";

type ChannelTab = "videos" | "shorts" | "posts" | "about";
type SortOrder = "latest" | "oldest";

const TABS: Array<{ value: ChannelTab; label: string }> = [
  { value: "videos", label: "Videos" },
  { value: "shorts", label: "Shorts" },
  { value: "posts", label: "Posts" },
  { value: "about", label: "About" },
];

function sortByDate<T extends { date: string }>(items: T[], order: SortOrder): T[] {
  return [...items].sort((a, b) => {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();
    const safeFirst = Number.isFinite(first) ? first : 0;
    const safeSecond = Number.isFinite(second) ? second : 0;
    return order === "latest" ? safeSecond - safeFirst : safeFirst - safeSecond;
  });
}

export function ChannelContent({ channel }: { channel: Channel }) {
  const [tab, setTab] = useState<ChannelTab>("videos");
  const [sort, setSort] = useState<SortOrder>("latest");

  const videos = useMemo<VideoWithChannel[]>(
    () =>
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
    [channel],
  );

  const regularVideos = useMemo(
    () => sortByDate(videos.filter((video) => !video.isShort), sort),
    [sort, videos],
  );
  const shorts = useMemo(
    () => sortByDate(videos.filter((video) => video.isShort), sort),
    [sort, videos],
  );
  const posts = useMemo(() => sortByDate(channel.posts, sort), [channel.posts, sort]);

  return (
    <div className="mt-6">
      <div className="flex gap-6 overflow-x-auto border-b border-border">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            aria-pressed={tab === item.value}
            className={cn(
              "relative shrink-0 py-3 text-sm transition-colors",
              tab === item.value
                ? "font-semibold text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent"
                : "text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "videos" || tab === "shorts" ? (
        <div className="mt-4 flex gap-2">
          <SortChip active={sort === "latest"} onClick={() => setSort("latest")}>
            Latest
          </SortChip>
          <SortChip active={sort === "oldest"} onClick={() => setSort("oldest")}>
            Oldest
          </SortChip>
        </div>
      ) : null}

      {tab === "videos" ? (
        regularVideos.length === 0 ? (
          <EmptyState
            icon={<VideoOff className="h-9 w-9" />}
            title="No videos yet"
            description="This channel has not published a full video yet."
          />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regularVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )
      ) : null}

      {tab === "shorts" ? (
        shorts.length === 0 ? (
          <EmptyState
            icon={<Clapperboard className="h-9 w-9" />}
            title="No Shorts yet"
            description="Short vertical videos under a minute will show up here."
          />
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
            {shorts.map((short) => (
              <Link
                key={short.id}
                href={shortHref(short.owner, short.repo, short.id)}
                className="relative aspect-[9/16] overflow-hidden rounded-lg border border-border bg-black"
              >
                {short.thumbnail ? (
                  <MediaImage
                    src={short.thumbnail}
                    alt=""
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-white/50">
                    <Clapperboard className="h-7 w-7" aria-hidden="true" />
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1.5 py-1.5 text-[11px] font-medium leading-4 text-white">
                  <span className="line-clamp-2">{short.title}</span>
                </span>
              </Link>
            ))}
          </div>
        )
      ) : null}

      {tab === "posts" ? (
        posts.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-9 w-9" />}
            title="No posts yet"
            description="Channel updates will show up here."
          />
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )
      ) : null}

      {tab === "about" ? (
        <div className="mt-4 max-w-2xl space-y-4 text-sm leading-6">
          <div className="rounded-xl border border-border p-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4" aria-hidden="true" />
              About
            </h2>
            <p className="mt-2 whitespace-pre-line text-muted">
              {channel.description || "This channel has not added a description."}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border p-4">
            <div>
              <dt className="text-xs text-muted">Subscribers</dt>
              <dd className="mt-0.5 font-medium">
                {formatSubscribers(channel.stars)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Videos</dt>
              <dd className="mt-0.5 font-medium">
                {formatCount(channel.videos.length)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Joined</dt>
              <dd className="mt-0.5 font-medium">
                {channel.createdAt
                  ? formatMonthYear(channel.createdAt)
                  : "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Repository</dt>
              <dd className="mt-0.5 truncate">
                <a
                  href={channel.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline"
                >
                  {channel.owner}/{channel.repo}
                </a>
              </dd>
            </div>
          </dl>

          <Link
            href={`/results?q=${encodeURIComponent(channel.name)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
          >
            <PlaySquare className="h-4 w-4" aria-hidden="true" />
            Find videos from this channel
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function SortChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-surface text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
