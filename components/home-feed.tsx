"use client";

import { useEffect, useState } from "react";

import { ShortsRow } from "@/components/shorts-row";
import { VideoCard } from "@/components/video-card";
import type { VideoWithChannel } from "@/lib/types";
import { pickRandom } from "@/lib/utils";

type HomeFeedProps = {
  videos: VideoWithChannel[];
  shorts: VideoWithChannel[];
};

const GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export function HomeFeed({ videos, shorts }: HomeFeedProps) {
  const [rows, setRows] = useState<VideoWithChannel[][]>([]);

  useEffect(() => {
    if (shorts.length === 0) {
      setRows([]);
      return;
    }

    const regular = videos.filter((video) => !video.isShort);
    const chunks: VideoWithChannel[][] = [];

    if (regular.length < 2) {
      chunks.push(pickRandom(shorts, Math.min(8, shorts.length)));
    }

    for (let index = 2; index <= regular.length; index += 8) {
      chunks.push(pickRandom(shorts, Math.min(8, shorts.length)));
    }

    setRows(chunks);
  }, [shorts, videos]);

  const regular = videos.filter((video) => !video.isShort);
  const firstChunk = regular.slice(0, 2);
  const remaining = regular.slice(2);
  const groups: VideoWithChannel[][] = [];

  for (let index = 0; index < remaining.length; index += 8) {
    groups.push(remaining.slice(index, index + 8));
  }

  return (
    <div className="space-y-6">
      {shorts.length > 0 && firstChunk.length < 2 && rows[0] ? (
        <ShortsRow shorts={rows[0]} />
      ) : null}

      {firstChunk.length > 0 ? (
        <div className={GRID_CLASS}>
          {firstChunk.map((video) => (
            <VideoCard
              key={`${video.owner}/${video.repo}/${video.id}`}
              video={video}
            />
          ))}
        </div>
      ) : null}

      {shorts.length > 0 && firstChunk.length >= 2 && rows[0] ? (
        <ShortsRow shorts={rows[0]} />
      ) : null}

      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-6">
          <div className={GRID_CLASS}>
            {group.map((video) => (
              <VideoCard
                key={`${video.owner}/${video.repo}/${video.id}`}
                video={video}
              />
            ))}
          </div>
          {shorts.length > 0 && rows[groupIndex + 1] ? (
            <ShortsRow shorts={rows[groupIndex + 1]} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
