"use client";

import { History } from "lucide-react";
import Link from "next/link";

import { VideoThumbnail } from "@/components/video-thumbnail";
import { HISTORY_KEY } from "@/lib/constants";
import { useLocalList } from "@/lib/local-store";
import type { VideoWithChannel } from "@/lib/types";
import { watchHref } from "@/lib/utils";

export function HistoryRow({ videos }: { videos: VideoWithChannel[] }) {
  const keys = useLocalList(HISTORY_KEY);
  const map = new Map<string, VideoWithChannel>();

  for (const video of videos) {
    map.set(`${video.owner}/${video.repo}/${video.id}`, video);
  }

  const items = keys
    .map((key) => map.get(key))
    .filter((video): video is VideoWithChannel => Boolean(video))
    .slice(0, 12);

  return (
    <section aria-label="History" className="mt-6">
      <div className="flex items-center justify-between px-3 sm:px-0">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <History className="h-5 w-5 text-muted" aria-hidden="true" />
          History
        </h2>
        <Link
          href="/history"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          See all
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-2 px-3 text-sm text-muted sm:px-0">
          Videos you watch will show up here.
        </p>
      ) : (
        <div className="-mx-3 mt-3 flex gap-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:px-0">
          {items.map((video) => (
            <Link
              key={`${video.owner}/${video.repo}/${video.id}`}
              href={watchHref(video.owner, video.repo, video.id)}
              className="w-40 shrink-0"
            >
              <VideoThumbnail
                video={video}
                className="rounded-lg border border-border"
              />
              <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-4">
                {video.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {video.channelName}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
