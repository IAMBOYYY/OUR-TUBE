import { ExternalLink, GitBranch } from "lucide-react";
import Link from "next/link";

import { ChannelDescription } from "@/components/channel-description";
import { MediaImage } from "@/components/media-image";
import { SubscribeButton } from "@/components/subscribe-button";
import type { Channel } from "@/lib/types";
import { formatCount, formatSubscribers } from "@/lib/utils";

export function ChannelHeader({ channel }: { channel: Channel }) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border">
        {channel.banner ? (
          <MediaImage
            src={channel.banner}
            alt={`${channel.name} banner`}
            className="h-28 w-full sm:h-40 lg:h-52"
          />
        ) : (
          <div className="h-28 w-full bg-surface sm:h-40 lg:h-52" />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <MediaImage
          src={channel.logo}
          alt={`${channel.name} logo`}
          className="h-20 w-20 shrink-0 rounded-full border border-border sm:h-28 sm:w-28"
        />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {channel.name}
          </h1>
          <p className="mt-1 text-sm text-muted">@{channel.owner}</p>
          <p className="mt-1 text-sm text-muted">
            {formatSubscribers(channel.stars)} · {formatCount(channel.videos.length)}{" "}
            {channel.videos.length === 1 ? "video" : "videos"}
          </p>

          <ChannelDescription channel={channel} />

          <div className="mt-4 flex flex-wrap gap-2">
            <SubscribeButton owner={channel.owner} repo={channel.repo} />
            <Link
              href={channel.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
            >
              <GitBranch className="h-4 w-4" aria-hidden="true" />
              Open on GitHub
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
