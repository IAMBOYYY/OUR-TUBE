import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaImage } from "@/components/media-image";
import { SuggestedVideos } from "@/components/suggested-videos";
import { VideoThumbnail } from "@/components/video-thumbnail";
import { getAllVideos, getChannel } from "@/lib/github";
import type { VideoWithChannel } from "@/lib/types";
import { channelHref, formatRelativeDate } from "@/lib/utils";

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
    description: video.description || `Watch ${video.title} on OurTube.`,
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
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <div className="overflow-hidden border-y border-border bg-black sm:rounded-lg sm:border">
            {video.type === "music" ? (
              <div>
                <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 px-4 py-10">
                  <VideoThumbnail
                    video={video}
                    allowVideoFallback={false}
                    showDuration={false}
                    className="w-48 rounded-md border border-neutral-800"
                  />
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Music
                  </span>
                </div>
                <div className="border-t border-neutral-800 p-3">
                  <audio
                    controls
                    preload="metadata"
                    aria-label={`${video.title} audio player`}
                    className="w-full"
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

          <div className="px-3 pt-4 sm:px-0">
            <h1 className="text-xl font-semibold leading-7 tracking-tight sm:text-2xl">
              {video.title}
            </h1>

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
                    @{channel.owner}/{channel.repo}
                  </p>
                </div>
              </Link>

              <p className="text-xs text-muted" suppressHydrationWarning>
                {formatRelativeDate(video.date)}
              </p>
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm text-muted">
                {video.type === "music" ? "Music" : "Video"}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6">
                {video.description || "No description was provided."}
              </p>

              {video.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-0">
          <SuggestedVideos
            videos={Array.from(suggestionPool.values())}
            excludeKey={currentKey}
          />
        </div>
      </div>
    </div>
  );
}
