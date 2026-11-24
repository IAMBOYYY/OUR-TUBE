import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowUpRightIcon,
  GithubIcon,
  MusicIcon,
  PlayIcon,
} from "@/components/icons";
import { SmartImage } from "@/components/smart-image";
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
      `${channel.name} publishes videos and music on OUR TUBE.`,
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="relative h-44 overflow-hidden rounded-3xl border border-border bg-card sm:h-60 lg:h-72">
        <SmartImage
          src={channel.banner}
          alt={`${channel.name} banner`}
          className="h-full w-full"
          imageClassName="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
      </div>

      <div className="relative -mt-12 px-4 sm:-mt-16 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-4 sm:gap-6">
            <SmartImage
              src={channel.logo}
              alt={`${channel.name} logo`}
              className="h-24 w-24 shrink-0 rounded-3xl border-4 border-background shadow-2xl sm:h-32 sm:w-32"
            />
            <div className="min-w-0 pb-1 sm:pb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Channel
              </p>
              <h1 className="mt-1 truncate text-3xl font-black tracking-tight sm:text-5xl">
                {channel.name}
              </h1>
              <p className="mt-1 truncate text-sm text-muted">
                @{channel.owner}/{channel.repo}
              </p>
            </div>
          </div>

          <Link
            href={channel.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:border-primary/30 hover:text-primary"
          >
            <GithubIcon className="h-4 w-4" />
            View repository
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 max-w-3xl">
          <p className="whitespace-pre-line text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {channel.description || "This channel has not added a description."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5">
              <PlayIcon className="h-3 w-3 text-primary" />
              {channel.videos.length}{" "}
              {channel.videos.length === 1 ? "upload" : "uploads"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5">
              <MusicIcon className="h-3 w-3 text-primary" />
              {musicCount} music
            </span>
            <span className="rounded-lg border border-border bg-card px-2.5 py-1.5">
              branch: {channel.defaultBranch}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-8 sm:mt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Videos
            </h2>
            <p className="mt-1 text-sm text-muted">
              Everything published by {channel.name}.
            </p>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
            <h3 className="text-lg font-bold">No uploads yet</h3>
            <p className="mt-2 text-sm text-muted">
              This channel has not added anything to videos.json.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
