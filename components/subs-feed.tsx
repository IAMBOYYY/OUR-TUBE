"use client";

import { ListVideo, VideoOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { VideoGridSkeleton } from "@/components/skeletons";
import { VideoCard } from "@/components/video-card";
import { FOLLOWING_KEY } from "@/lib/constants";
import { useLocalList } from "@/lib/local-store";
import type { Channel, VideoWithChannel } from "@/lib/types";

type SubsFeedProps = {
  channels: Channel[];
  videos: VideoWithChannel[];
};

export function SubsFeed({ channels, videos }: SubsFeedProps) {
  const following = useLocalList(FOLLOWING_KEY);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const followed = useMemo(() => {
    const set = new Set(following);
    return channels.filter((channel) => set.has(`${channel.owner}/${channel.repo}`));
  }, [channels, following]);

  const latest = useMemo(() => {
    const set = new Set(following);
    return videos
      .filter((video) => set.has(`${video.owner}/${video.repo}`))
      .sort((a, b) => {
        const first = new Date(a.date).getTime();
        const second = new Date(b.date).getTime();
        return (Number.isFinite(second) ? second : 0) - (Number.isFinite(first) ? first : 0);
      });
  }, [following, videos]);

  if (!mounted) {
    return <VideoGridSkeleton count={8} />;
  }

  if (followed.length === 0) {
    return (
      <EmptyState
        icon={<ListVideo className="h-10 w-10" />}
        title="No subscriptions yet"
        description="Subscribe to channels on this device to see their latest videos here."
      >
        <Link
          href="/channels"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
        >
          Browse channels
        </Link>
      </EmptyState>
    );
  }

  if (latest.length === 0) {
    return (
      <EmptyState
        icon={<VideoOff className="h-10 w-10" />}
        title="No videos yet"
        description="The channels you follow have not published a video yet."
      >
        <Link
          href="/channels"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
        >
          Browse channels
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {latest.map((video) => (
        <VideoCard key={`${video.owner}/${video.repo}/${video.id}`} video={video} />
      ))}
    </div>
  );
}
