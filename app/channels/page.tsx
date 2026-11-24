import type { Metadata } from "next";
import { VideoOff } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/media-image";
import { getChannels } from "@/lib/github";
import { channelHref } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Channels",
  description: "Browse channels published on GitHub through OurTube.",
};

export default async function ChannelsPage() {
  const channels = await getChannels();

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <h1 className="text-xl font-semibold tracking-tight">Channels</h1>

      {channels.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-24 text-center">
          <VideoOff className="h-10 w-10 text-muted" aria-hidden="true" />
          <p className="mt-4 text-lg font-semibold">No channels right now</p>
          <p className="mt-2 text-sm text-muted">
            Check back soon. New channels show up here.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Link
              key={`${channel.owner}/${channel.repo}`}
              href={channelHref(channel.owner, channel.repo)}
              className="group flex gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-surface"
            >
              <MediaImage
                src={channel.logo}
                alt={`${channel.name} logo`}
                className="h-14 w-14 shrink-0 rounded-full border border-border"
              />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-medium transition-colors group-hover:text-muted">
                  {channel.name}
                </h2>
                <p className="mt-0.5 truncate text-xs text-muted">
                  @{channel.owner}/{channel.repo}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">
                  {channel.description || "No description."}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {channel.videos.length}{" "}
                  {channel.videos.length === 1 ? "video" : "videos"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
