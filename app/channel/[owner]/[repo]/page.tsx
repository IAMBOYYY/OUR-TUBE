import type { Metadata } from "next";
import { ExternalLink, GitBranch, VideoOff } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaImage } from "@/components/media-image";
import { VideoCard } from "@/components/video-card";
import { getChannel } from "@/lib/github";

export const revalidate = 300;

type ChannelPageProps = {
  params: Promise<{ owner: string; repo: string }>;
};

export async function generateMetadata({
  params,
}: ChannelPageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  const channel = await getChannel(owner, repo);

  if (!channel) {
    return { title: "Channel not found" };
  }

  return {
    title: channel.name,
    description:
      channel.description ||
      `${channel.name} publishes videos and music on OurTube.`,
    openGraph: {
      title: channel.name,
      description: channel.description,
      type: "website",
    },
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { owner, repo } = await params;
  const channel = await getChannel(owner, repo);

  if (!channel) {
    notFound();
  }

  const videos = channel.videos.map((video) => ({
    ...video,
    owner: channel.owner,
    repo: channel.repo,
    channelName: channel.name,
    channelLogo: channel.logo,
    channelHtmlUrl: channel.htmlUrl,
  }));
  const musicCount = channel.videos.filter(
    (video) => video.type === "music",
  ).length;

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="overflow-hidden rounded-lg border border-border">
        <MediaImage
          src={channel.banner}
          alt={`${channel.name} banner`}
          className="h-32 w-full sm:h-48 lg:h-56"
        />
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <MediaImage
          src={channel.logo}
          alt={`${channel.name} logo`}
          className="h-20 w-20 shrink-0 rounded-full border border-border sm:h-28 sm:w-28"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                {channel.name}
              </h1>
              <p className="mt-1 text-sm text-muted">
                @{channel.owner}/{channel.repo}
              </p>
            </div>

            <Link
              href={channel.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface"
            >
              <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
              Repository
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
            {channel.description || "This channel has not added a description."}
          </p>

          <p className="mt-2 text-xs text-muted">
            {channel.videos.length}{" "}
            {channel.videos.length === 1 ? "video" : "videos"}
            {musicCount > 0 ? ` · ${musicCount} music` : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <h2 className="text-base font-semibold">Videos</h2>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-20 text-center">
            <VideoOff className="h-9 w-9 text-muted" aria-hidden="true" />
            <p className="mt-4 text-base font-semibold">No videos right now</p>
            <p className="mt-1 text-sm text-muted">
              Check back soon. New videos show up here.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard
                key={`${video.owner}/${video.repo}/${video.id}`}
                video={video}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
