"use client";

import Link from "next/link";

import { MediaImage } from "@/components/media-image";
import { VideoMenu } from "@/components/video-menu";
import { VideoThumbnail } from "@/components/video-thumbnail";
import type { VideoWithChannel } from "@/lib/types";
import {
  channelHref,
  formatRelativeDate,
  watchHref,
} from "@/lib/utils";

type VideoCardProps = {
  video: VideoWithChannel;
  compact?: boolean;
};

export function VideoCard({ video, compact = false }: VideoCardProps) {
  const href = watchHref(video.owner, video.repo, video.id);
  const channel = channelHref(video.owner, video.repo);

  if (compact) {
    return (
      <div className="group flex gap-2">
        <Link href={href} className="shrink-0" tabIndex={-1} aria-hidden="true">
          <VideoThumbnail
            video={video}
            className="w-40 rounded-lg border border-border"
          />
        </Link>
        <div className="min-w-0 flex-1 py-0.5">
          <Link href={href}>
            <h3 className="line-clamp-2 text-sm font-medium leading-5 transition-colors group-hover:text-muted">
              {video.title}
            </h3>
          </Link>
          <Link
            href={channel}
            className="mt-1 block truncate text-xs text-muted transition-colors hover:text-foreground"
          >
            {video.channelName}
          </Link>
          <p
            className="mt-0.5 text-xs text-muted"
            suppressHydrationWarning
          >
            {formatRelativeDate(video.date)}
          </p>
        </div>
        <VideoMenu video={video} />
      </div>
    );
  }

  return (
    <article className="group min-w-0">
      <Link href={href} className="block" aria-label={video.title}>
        <VideoThumbnail
          video={video}
          className="rounded-none border-0 sm:rounded-xl sm:border sm:border-border"
        />
      </Link>

      <div className="mt-3 flex gap-3 px-3 sm:mt-2 sm:px-0">
        <Link href={channel} className="mt-0.5 shrink-0">
          <MediaImage
            src={video.channelLogo}
            alt=""
            className="h-9 w-9 rounded-full border border-border"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <Link href={href} className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-medium leading-5 transition-colors group-hover:text-muted">
                {video.title}
              </h3>
            </Link>
            <div className="-my-1 -mr-2">
              <VideoMenu video={video} />
            </div>
          </div>
          <p
            className="mt-1 truncate text-xs text-muted"
            suppressHydrationWarning
          >
            <Link
              href={channel}
              className="transition-colors hover:text-foreground"
            >
              {video.channelName}
            </Link>
            {" · "}
            {formatRelativeDate(video.date)}
          </p>
        </div>
      </div>
    </article>
  );
}
