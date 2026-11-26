"use client";

import { Clapperboard, FileText, Tv, Video, VideoOff } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ChannelRow } from "@/components/channel-row";
import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import { ShortsGrid } from "@/components/shorts-grid";
import { VideoCard } from "@/components/video-card";
import { searchSiteData } from "@/lib/search";
import type { SiteData } from "@/lib/types";
import { cn } from "@/lib/utils";

type ResultTab = "all" | "videos" | "shorts" | "channels" | "posts";

const TABS: Array<{ value: ResultTab; label: string }> = [
  { value: "all", label: "All" },
  { value: "videos", label: "Videos" },
  { value: "shorts", label: "Shorts" },
  { value: "channels", label: "Channels" },
  { value: "posts", label: "Posts" },
];

export function SearchResults({
  data,
  query,
}: {
  data: SiteData;
  query: string;
}) {
  const [tab, setTab] = useState<ResultTab>("all");
  const results = useMemo(() => searchSiteData(data, query), [data, query]);

  const regularVideos = results.videos.filter((video) => !video.isShort);
  const tags = useMemo(() => {
    const set = new Set<string>();

    for (const video of results.videos) {
      for (const tag of video.tags) {
        set.add(tag);
      }
    }

    return Array.from(set).slice(0, 12);
  }, [results.videos]);

  const total =
    regularVideos.length +
    results.shorts.length +
    results.channels.length +
    results.posts.length;

  return (
    <div>
      <p className="mt-1 px-3 text-sm text-muted sm:px-0">
        {total} {total === 1 ? "result" : "results"} for{" "}
        <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
      </p>

      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 px-3 sm:px-0">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/results?q=${encodeURIComponent(tag)}`}
              className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex gap-6 overflow-x-auto border-b border-border px-3 sm:px-0">
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

      {total === 0 ? (
        <EmptyState
          icon={<VideoOff className="h-10 w-10" />}
          title="No results"
          description={`Nothing matched "${query}". Try another word or a tag.`}
        >
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
          >
            Go home
          </Link>
        </EmptyState>
      ) : null}

      {tab === "all" && total > 0 ? (
        <div className="mt-5 space-y-8">
          {regularVideos.length > 0 ? (
            <Section icon={<Video className="h-5 w-5" />} title="Videos">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {regularVideos.slice(0, 8).map((video) => (
                  <VideoCard
                    key={`${video.owner}/${video.repo}/${video.id}`}
                    video={video}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {results.shorts.length > 0 ? (
            <Section icon={<Clapperboard className="h-5 w-5 text-accent" />} title="Shorts">
              <ShortsGrid shorts={results.shorts.slice(0, 9)} className="grid-cols-3 sm:grid-cols-4 lg:grid-cols-6" />
            </Section>
          ) : null}

          {results.channels.length > 0 ? (
            <Section icon={<Tv className="h-5 w-5" />} title="Channels">
              <div className="rounded-xl border border-border px-3 sm:px-4">
                {results.channels.slice(0, 6).map((channel) => (
                  <ChannelRow
                    key={`${channel.owner}/${channel.repo}`}
                    channel={channel}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {results.posts.length > 0 ? (
            <Section icon={<FileText className="h-5 w-5" />} title="Posts">
              <div className="grid gap-3 sm:grid-cols-2">
                {results.posts.slice(0, 4).map((post) => (
                  <PostCard key={`${post.owner}/${post.repo}/${post.id}`} post={post} />
                ))}
              </div>
            </Section>
          ) : null}
        </div>
      ) : null}

      {tab === "videos" && total > 0 ? (
        regularVideos.length === 0 ? (
          <EmptyState
            icon={<VideoOff className="h-10 w-10" />}
            title="No videos"
            description="Try the Shorts tab."
          />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regularVideos.map((video) => (
              <VideoCard
                key={`${video.owner}/${video.repo}/${video.id}`}
                video={video}
              />
            ))}
          </div>
        )
      ) : null}

      {tab === "shorts" && total > 0 ? (
        results.shorts.length === 0 ? (
          <EmptyState
            icon={<Clapperboard className="h-10 w-10" />}
            title="No Shorts"
            description="Try the Videos tab."
          />
        ) : (
          <div className="mt-5">
            <ShortsGrid shorts={results.shorts} className="grid-cols-3 sm:grid-cols-4 lg:grid-cols-6" />
          </div>
        )
      ) : null}

      {tab === "channels" && total > 0 ? (
        results.channels.length === 0 ? (
          <EmptyState
            icon={<Tv className="h-10 w-10" />}
            title="No channels"
            description="Try another search."
          />
        ) : (
          <div className="mt-5 rounded-xl border border-border px-3 sm:px-4">
            {results.channels.map((channel) => (
              <ChannelRow
                key={`${channel.owner}/${channel.repo}`}
                channel={channel}
              />
            ))}
          </div>
        )
      ) : null}

      {tab === "posts" && total > 0 ? (
        results.posts.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="No posts"
            description="Try another search."
          />
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {results.posts.map((post) => (
              <PostCard key={`${post.owner}/${post.repo}/${post.id}`} post={post} />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 px-3 text-base font-semibold sm:px-0">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}
