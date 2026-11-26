import type { Metadata } from "next";
import { Music } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { FeedError } from "@/components/feed-states";
import { MusicCard } from "@/components/music-card";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Music",
  description: "Listen to music published openly on GitHub.",
};

export default async function MusicPage() {
  const { music, channels, failed } = await getSiteData();

  if (failed && channels.length === 0) {
    return <FeedError />;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <h1 className="px-3 text-xl font-semibold tracking-tight sm:px-0">
        Music
      </h1>

      {music.length === 0 ? (
        <EmptyState
          icon={<Music className="h-10 w-10" />}
          title="No music yet"
          description="Audio releases will show up here."
        />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {music.map((video) => (
            <MusicCard key={`${video.owner}/${video.repo}/${video.id}`} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
