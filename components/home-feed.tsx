"use client";

import { useEffect, useMemo, useState } from "react";

import { NoResults } from "@/components/feed-states";
import { useSearch } from "@/components/search-provider";
import { VideoGridSkeleton } from "@/components/skeletons";
import { VideoCard } from "@/components/video-card";
import type { VideoWithChannel } from "@/lib/types";
import { matchesQuery, shuffle } from "@/lib/utils";

type HomeFeedProps = {
  videos: VideoWithChannel[];
};

export function HomeFeed({ videos }: HomeFeedProps) {
  const { query, filter } = useSearch();
  const [orderedVideos, setOrderedVideos] = useState<
    VideoWithChannel[] | null
  >(null);

  useEffect(() => {
    setOrderedVideos(shuffle(videos));
  }, [videos]);

  const filteredVideos = useMemo(
    () =>
      (orderedVideos ?? []).filter(
        (video) =>
          (filter === "all" || video.type === filter) &&
          matchesQuery(video, query),
      ),
    [filter, orderedVideos, query],
  );

  if (orderedVideos === null) {
    return (
      <VideoGridSkeleton
        count={Math.min(Math.max(videos.length, 8), 12)}
      />
    );
  }

  if (filteredVideos.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredVideos.map((video) => (
        <VideoCard
          key={`${video.owner}/${video.repo}/${video.id}`}
          video={video}
        />
      ))}
    </div>
  );
}
