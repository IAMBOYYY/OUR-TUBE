"use client";

import { useEffect, useState } from "react";

import { VideoGridSkeleton } from "@/components/skeletons";
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
    <aside aria-label="More videos">
      <h2 className="mb-3 text-base font-semibold">More videos</h2>

      {suggested === null ? (
        <VideoGridSkeleton count={6} compact />
      ) : suggested.length === 0 ? (
        <p className="text-sm text-muted">No more videos right now.</p>
      ) : (
        <div className="space-y-3">
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
