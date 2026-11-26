import Link from "next/link";

import { MediaImage } from "@/components/media-image";
import { SubscribeButton } from "@/components/subscribe-button";
import type { Channel } from "@/lib/types";
import { channelHref, formatCount, formatSubscribers } from "@/lib/utils";

export function ChannelRow({ channel }: { channel: Channel }) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <Link
        href={channelHref(channel.owner, channel.repo)}
        className="shrink-0"
        tabIndex={-1}
        aria-hidden="true"
      >
        <MediaImage
          src={channel.logo}
          alt=""
          className="h-14 w-14 rounded-full border border-border sm:h-16 sm:w-16"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={channelHref(channel.owner, channel.repo)}
          className="block truncate text-sm font-medium hover:underline sm:text-base"
        >
          {channel.name}
        </Link>
        <p className="truncate text-xs text-muted">@{channel.owner}</p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {formatSubscribers(channel.stars)} · {formatCount(channel.videos.length)}{" "}
          {channel.videos.length === 1 ? "video" : "videos"}
        </p>
      </div>

      <SubscribeButton
        owner={channel.owner}
        repo={channel.repo}
        size="sm"
        className="min-w-24"
      />
    </div>
  );
}
