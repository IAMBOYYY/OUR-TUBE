import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionRow } from "@/components/action-row";
import { FeedError } from "@/components/feed-states";
import { MediaImage } from "@/components/media-image";
import { MusicPlayer } from "@/components/player/music-player";
import { VideoPlayer } from "@/components/player/video-player";
import { SubscribeButton } from "@/components/subscribe-button";
import { VideoCard } from "@/components/video-card";
import { VideoDescription } from "@/components/video-description";
import { getChannel, getSiteData } from "@/lib/github";
import type { VideoWithChannel } from "@/lib/types";
import {
  channelHref,
  formatRelativeDate,
  formatSubscribers,
  watchHref,
} from "@/lib/utils";

export const revalidate = 300;
export const maxDuration = 60;

type WatchPageProps = {
  params: Promise<{ owner: string; repo: string; id: string }>;
};

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { owner, repo, id } = await params;
  const channel = await getChannel(owner, repo);
  const video = channel?.videos.find((item) => item.id === id);

  if (!channel || !video) {
    return { title: "Video not found" };
  }

  return {
    title: video.title,
    description: video.description || `Watch ${video.title} on OurTube.`,
    openGraph: {
      title: video.title,
      description: video.description,
      type: "video.other",
      images: video.thumbnail ? [{ url: video.thumbnail }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description: video.description,
      images: video.thumbnail ? [video.thumbnail] : undefined,
    },
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { owner, repo, id } = await params;
  const [channel, site] = await Promise.all([getChannel(owner, repo), getSiteData()]);

  if (!channel) {
    if (site.failed && site.channels.length === 0) {
      return <FeedError />;
    }

    notFound();
  }

  const video = channel.videos.find((item) => item.id === id);

  if (!video) {
    notFound();
  }

  const currentKey = `${channel.owner}/${channel.repo}/${video.id}`;
  const current: VideoWithChannel = {
    ...video,
    owner: channel.owner,
    repo: channel.repo,
    channelName: channel.name,
    channelLogo: channel.logo,
    channelHtmlUrl: channel.htmlUrl,
    hasDiscussions: channel.hasDiscussions,
    stars: channel.stars,
  };

  const channelVideos: VideoWithChannel[] = channel.videos.map((item) => ({
    ...item,
    owner: channel.owner,
    repo: channel.repo,
    channelName: channel.name,
    channelLogo: channel.logo,
    channelHtmlUrl: channel.htmlUrl,
    hasDiscussions: channel.hasDiscussions,
    stars: channel.stars,
  }));

  const pool = new Map<string, VideoWithChannel>();

  for (const item of [...site.videos, ...channelVideos]) {
    const key = `${item.owner}/${item.repo}/${item.id}`;

    if (key !== currentKey) {
      pool.set(key, item);
    }
  }

  const upNext = Array.from(pool.values())
    .sort((a, b) => {
      const first = new Date(a.date).getTime();
      const second = new Date(b.date).getTime();
      return (Number.isFinite(second) ? second : 0) - (Number.isFinite(first) ? first : 0);
    })
    .slice(0, 10);

  const next = upNext[0];

  return (
    <div className="mx-auto max-w-[1600px] px-0 py-0 sm:px-4 sm:py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <div className="sticky top-[97px] z-20 bg-black lg:static lg:overflow-hidden lg:rounded-xl lg:border lg:border-border">
            {current.type === "music" ? (
              <MusicPlayer video={current} />
            ) : (
              <VideoPlayer
                video={current}
                nextHref={next ? watchHref(next.owner, next.repo, next.id) : undefined}
                nextTitle={next?.title}
              />
            )}
          </div>

          <div className="px-3 pt-4 sm:px-0">
            <h1 className="text-xl font-semibold leading-7 tracking-tight sm:text-2xl">
              {current.title}
            </h1>

            <p
              className="mt-1 text-sm text-muted"
              suppressHydrationWarning
            >
              {formatSubscribers(channel.stars)} · {formatRelativeDate(current.date)}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={channelHref(channel.owner, channel.repo)}
                className="group flex min-w-0 items-center gap-3"
              >
                <MediaImage
                  src={channel.logo}
                  alt={`${channel.name} logo`}
                  className="h-10 w-10 shrink-0 rounded-full border border-border"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium transition-colors group-hover:text-muted">
                    {channel.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {formatSubscribers(channel.stars)}
                  </p>
                </div>
              </Link>

              <SubscribeButton owner={channel.owner} repo={channel.repo} />
            </div>

            <div className="mt-4">
              <ActionRow video={current} />
            </div>

            <div className="mt-4">
              <VideoDescription
                description={current.description}
                tags={current.tags}
                dateLabel={formatRelativeDate(current.date)}
              />
            </div>
          </div>

          <div className="mt-6 px-3 sm:px-0 lg:hidden">
            <h2 className="mb-3 text-base font-semibold">Up next</h2>
            <div className="space-y-3">
              {upNext.map((item) => (
                <VideoCard
                  key={`${item.owner}/${item.repo}/${item.id}`}
                  video={item}
                  compact
                />
              ))}
            </div>
          </div>
        </div>

        <aside aria-label="Up next" className="hidden px-3 sm:px-0 lg:block">
          <h2 className="mb-3 text-base font-semibold">Up next</h2>
          <div className="space-y-3">
            {upNext.map((item) => (
              <VideoCard
                key={`${item.owner}/${item.repo}/${item.id}`}
                video={item}
                compact
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
