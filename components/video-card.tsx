import Link from "next/link";

import { MusicIcon, PlayIcon } from "@/components/icons";
import { SmartImage } from "@/components/smart-image";
import type { VideoWithChannel } from "@/lib/types";
import { cn, formatDate, watchHref } from "@/lib/utils";

type VideoCardProps = {
  video: VideoWithChannel;
  compact?: boolean;
};

export function VideoCard({ video, compact = false }: VideoCardProps) {
  const href = watchHref(video.owner, video.repo, video.id);

  if (compact) {
    return (
      <Link
        href={href}
        className="group flex gap-3 rounded-2xl p-2 transition hover:bg-card"
      >
        <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-card sm:w-40">
          <SmartImage
            src={video.thumbnail}
            alt=""
            className="h-full w-full"
            imageClassName="transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-md bg-black/55 text-white backdrop-blur-sm">
            {video.type === "music" ? (
              <MusicIcon className="h-3 w-3" />
            ) : (
              <PlayIcon className="ml-px h-2.5 w-2.5" />
            )}
          </span>
        </div>
        <div className="min-w-0 py-0.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-primary">
            {video.title}
          </h3>
          <p className="mt-1 truncate text-xs text-muted">{video.channelName}</p>
          <p className="mt-0.5 text-[11px] text-muted/80">
            {formatDate(video.date)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <article className="group min-w-0">
      <Link href={href} className="block">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition duration-300 group-hover:border-primary/20 group-hover:shadow-xl group-hover:shadow-rose-500/10">
          <SmartImage
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full"
            imageClassName="transition duration-700 group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10 opacity-80" />
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
            {video.type === "music" ? (
              <MusicIcon className="h-3 w-3" />
            ) : (
              <PlayIcon className="h-2.5 w-2.5" />
            )}
            {video.type}
          </span>
          <span className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-md">
              <PlayIcon className="ml-0.5 h-[18px] w-[18px]" />
            </span>
          </span>
        </div>

        <div className="mt-3 flex gap-3">
          <SmartImage
            src={video.channelLogo}
            alt=""
            className="mt-0.5 h-9 w-9 shrink-0 rounded-full border border-border"
          />
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-snug transition group-hover:text-primary">
              {video.title}
            </h3>
            <p className="mt-1 truncate text-sm text-muted">
              {video.channelName}
            </p>
            <p className={cn("mt-0.5 truncate text-xs text-muted/80")}>
              {formatDate(video.date)}
              {video.tags[0] ? ` · ${video.tags[0]}` : ""}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
