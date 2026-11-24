"use client";

import { useEffect, useState } from "react";

import { VideoCardSkeleton } from "@/components/skeletons";
import { VideoCard } from "@/components/video-card";
import type { VideoWithChannel } from "@/lib/types";
import { pickRandom } from "@/lib/utils";

type SuggestedVideosProps = {
  videos: VideoWithChannel[];
  excludeKey: string;
};

export function SuggestedVideos({ videos, excludeKey }: SuggestedVideosProps) {
  const [suggested, setSuggested] = useState<VideoWithChannel[] | null>(null);

  useEffect(() => {
    const candidates = videos.filter(
      (video) => `${video.owner}/${video.repo}/${video.id}` !== excludeKey,
    );
    setSuggested(pickRandom(candidates, 8));
  }, [videos, excludeKey]);

  return (
    <aside aria-label="Suggested videos">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Up next</h2>
          <p className="text-xs text-muted">A random mix from the community</p>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
          Shuffled
        </span>
      </div>

      {suggested === null ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <VideoCardSkeleton key={index} compact />
          ))}
        </div>
      ) : suggested.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
          No other videos are available yet.
        </div>
      ) : (
        <div className="space-y-1">
          {suggested.map((video) => (
            <VideoCard
              key={`${video.owner}/${video.repo}/${video.id}`}
              video={video}
              compact
            />
          ))}
        </div>
      )}
    </aside>
  );
}
