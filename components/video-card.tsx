import Link from "next/link";

import { MediaImage } from "@/components/media-image";
import { VideoThumbnail } from "@/components/video-thumbnail";
import type { VideoWithChannel } from "@/lib/types";
import { formatRelativeDate, watchHref } from "@/lib/utils";

type VideoCardProps = {
  video: VideoWithChannel;
  compact?: boolean;
};

export function VideoCard({ video, compact = false }: VideoCardProps) {
  const href = watchHref(video.owner, video.repo, video.id);

  if (compact) {
    return (
      <Link href={href} className="group flex gap-2">
        <VideoThumbnail
          video={video}
          className="w-40 shrink-0 rounded-md border border-border"
        />
        <div className="min-w-0 py-0.5">
          <h3 className="line-clamp-2 text-sm font-medium leading-5 transition-colors group-hover:text-muted">
            {video.title}
          </h3>
          <p className="mt-1 truncate text-xs text-muted">{video.channelName}</p>
          <p className="mt-0.5 text-xs text-muted" suppressHydrationWarning>
            {formatRelativeDate(video.date)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block min-w-0">
      <VideoThumbnail
        video={video}
        className="rounded-none border-0 sm:rounded-lg sm:border sm:border-border"
      />

      <div className="mt-3 flex gap-3 px-3 sm:mt-2 sm:px-0">
        <MediaImage
          src={video.channelLogo}
          alt=""
          className="mt-0.5 h-9 w-9 shrink-0 rounded-full border border-border"
        />
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-5 transition-colors group-hover:text-muted">
            {video.title}
          </h3>
          <p className="mt-1 truncate text-xs text-muted">{video.channelName}</p>
          <p className="mt-0.5 text-xs text-muted" suppressHydrationWarning>
            {formatRelativeDate(video.date)}
          </p>
        </div>
      </div>
    </Link>
  );
}
