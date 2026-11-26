"use client";

import { Music } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/media-image";
import { VideoMenu } from "@/components/video-menu";
import type { VideoWithChannel } from "@/lib/types";
import { channelHref, formatRelativeDate, watchHref } from "@/lib/utils";

export function MusicCard({ video }: { video: VideoWithChannel }) {
  const href = watchHref(video.owner, video.repo, video.id);
  const channel = channelHref(video.owner, video.repo);

  return (
    <article className="group min-w-0">
      <div className="relative">
        <Link href={href} aria-label={video.title}>
          <MediaImage
            src={video.thumbnail ?? ""}
            alt=""
            className="aspect-square w-full rounded-none sm:rounded-xl"
          />
        </Link>
        <span className="pointer-events-none absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white">
          <Music className="h-4 w-4" aria-hidden="true" />
        </span>
        {video.duration ? (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-[11px] font-medium leading-none text-white">
            {video.duration}
          </span>
        ) : null}
        <div className="absolute right-1 top-1">
          <VideoMenu video={video} />
        </div>
      </div>

      <div className="mt-2 px-3 sm:px-0">
        <Link href={href}>
          <h3 className="line-clamp-2 text-sm font-medium leading-5 transition-colors group-hover:text-muted">
            {video.title}
          </h3>
        </Link>
        <p
          className="mt-1 truncate text-xs text-muted"
          suppressHydrationWarning
        >
          <Link href={channel} className="transition-colors hover:text-foreground">
            {video.channelName}
          </Link>
          {" · "}
          {formatRelativeDate(video.date)}
        </p>
      </div>
    </article>
  );
}
