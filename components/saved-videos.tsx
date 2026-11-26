"use client";

import { Trash2, VideoOff, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { VideoGridSkeleton } from "@/components/skeletons";
import { VideoCard } from "@/components/video-card";
import { useLocalList, writeList, removeFromList } from "@/lib/local-store";
import type { VideoWithChannel } from "@/lib/types";

type SavedVideosProps = {
  videos: VideoWithChannel[];
  storageKey: string;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function SavedVideos({
  videos,
  storageKey,
  title,
  emptyTitle,
  emptyDescription,
}: SavedVideosProps) {
  const keys = useLocalList(storageKey);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const byKey = useMemo(() => {
    const map = new Map<string, VideoWithChannel>();

    for (const video of videos) {
      map.set(`${video.owner}/${video.repo}/${video.id}`, video);
    }

    return map;
  }, [videos]);

  const items = keys
    .map((key) => ({ key, video: byKey.get(key) }))
    .filter((item): item is { key: string; video: VideoWithChannel } => Boolean(item.video));

  if (!mounted) {
    return <VideoGridSkeleton count={8} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<VideoOff className="h-10 w-10" />}
        title={emptyTitle}
        description={emptyDescription}
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
        >
          Browse videos
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-3 sm:px-0">
        <p className="text-sm text-muted">
          {items.length} {items.length === 1 ? "video" : "videos"}
        </p>
        <button
          type="button"
          onClick={() => writeList(storageKey, [])}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-3 text-xs font-medium transition-colors hover:bg-surface"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear {title}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(({ key, video }) => (
          <div key={key} className="relative">
            <button
              type="button"
              onClick={() => removeFromList(storageKey, key)}
              aria-label="Remove"
              className="absolute right-2 top-2 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/85"
            >
              <X className="h-4 w-4" />
            </button>
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
}
