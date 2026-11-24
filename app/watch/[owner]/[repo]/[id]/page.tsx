import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  MusicIcon,
  PlayIcon,
} from "@/components/icons";
import { SmartImage } from "@/components/smart-image";
import { SuggestedVideos } from "@/components/suggested-videos";
import { getAllVideos, getChannel } from "@/lib/github";
import type { VideoWithChannel } from "@/lib/types";
import { channelHref, formatDate } from "@/lib/utils";

export const revalidate = 300;

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
    description: video.description || `Watch ${video.title} on OUR TUBE.`,
    openGraph: {
      title: video.title,
      description: video.description,
      type: "video.other",
      images: video.thumbnail ? [{ url: video.thumbnail }] : undefined,
    },
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { owner, repo, id } = await params;
  const [channel, allVideos] = await Promise.all([
    getChannel(owner, repo),
    getAllVideos(),
  ]);

  if (!channel) {
    notFound();
  }

  const video = channel.videos.find((item) => item.id === id);

  if (!video) {
    notFound();
  }

  const currentKey = `${channel.owner}/${channel.repo}/${video.id}`;
  const channelVideos: VideoWithChannel[] = channel.videos.map((item) => ({
    ...item,
    owner: channel.owner,
    repo: channel.repo,
    channelName: channel.name,
    channelLogo: channel.logo,
    channelHtmlUrl: channel.htmlUrl,
  }));
  const suggestionPool = new Map<string, VideoWithChannel>();

  for (const item of [...allVideos, ...channelVideos]) {
    suggestionPool.set(`${item.owner}/${item.repo}/${item.id}`, item);
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Discover
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-2xl shadow-black/20">
            {video.type === "music" ? (
              <div className="relative w-full overflow-hidden bg-black">
                <div className="absolute inset-0">
                  <SmartImage
                    src={video.thumbnail}
                    alt=""
                    className="h-full w-full"
                    imageClassName="scale-110 blur-2xl opacity-40"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black" />

                <div className="relative flex min-h-[24rem] flex-col items-center justify-center px-4 py-10 text-center sm:min-h-[30rem]">
                  <SmartImage
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-28 w-28 rounded-2xl border border-white/15 shadow-2xl sm:h-36 sm:w-36"
                  />
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                    <MusicIcon className="h-3 w-3" />
                    Music
                  </span>
                  <h2 className="mt-2 line-clamp-2 max-w-2xl text-lg font-bold text-white sm:text-2xl">
                    {video.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/60">{channel.name}</p>
                  <audio
                    controls
                    preload="metadata"
                    aria-label={`${video.title} audio player`}
                    className="mt-8 w-full max-w-2xl"
                  >
                    <source src={video.videoUrl} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            ) : (
              <video
                controls
                playsInline
                preload="metadata"
                poster={video.thumbnail}
                aria-label={`${video.title} video player`}
                className="aspect-video w-full bg-black"
              >
                <source src={video.videoUrl} />
                Your browser does not support the video element.
              </video>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 uppercase tracking-wide">
              {video.type === "music" ? (
                <MusicIcon className="h-3 w-3 text-primary" />
              ) : (
                <PlayIcon className="h-3 w-3 text-primary" />
              )}
              {video.type}
            </span>
            <span>{formatDate(video.date)}</span>
            <span aria-hidden="true">·</span>
            <span>{channel.name}</span>
          </div>

          <h1 className="mt-3 text-balance text-2xl font-black tracking-tight sm:text-3xl">
            {video.title}
          </h1>

          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={channelHref(channel.owner, channel.repo)}
              className="group flex min-w-0 items-center gap-3"
            >
              <SmartImage
                src={channel.logo}
                alt={`${channel.name} logo`}
                className="h-11 w-11 shrink-0 rounded-full border border-border"
              />
              <div className="min-w-0">
                <p className="truncate font-bold transition group-hover:text-primary">
                  {channel.name}
                </p>
                <p className="truncate text-xs text-muted">
                  @{channel.owner}/{channel.repo}
                </p>
              </div>
            </Link>
            <Link
              href={channelHref(channel.owner, channel.repo)}
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
            >
              View channel
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 rounded-2xl bg-card/70 p-4 sm:p-5">
            <p className="whitespace-pre-line text-sm leading-6 text-muted">
              {video.description || "No description was provided."}
            </p>
            {video.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <SuggestedVideos
          videos={Array.from(suggestionPool.values())}
          excludeKey={currentKey}
        />
      </div>
    </div>
  );
}
