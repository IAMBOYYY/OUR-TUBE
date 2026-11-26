import type { Metadata } from "next";

import { FeedError } from "@/components/feed-states";
import { SavedVideos } from "@/components/saved-videos";
import { LIKED_KEY } from "@/lib/constants";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Liked videos",
  description: "Videos you liked on this device.",
};

export default async function LikedPage() {
  const { videos, failed } = await getSiteData();

  if (failed && videos.length === 0) {
    return <FeedError />;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <h1 className="px-3 text-xl font-semibold tracking-tight sm:px-0">
        Liked videos
      </h1>
      <SavedVideos
        videos={videos}
        storageKey={LIKED_KEY}
        title="Liked videos"
        emptyTitle="No liked videos yet"
        emptyDescription="Tap Like on a video to keep it here on this device."
      />
    </div>
  );
}
