import type { Metadata } from "next";

import { FeedError } from "@/components/feed-states";
import { SavedVideos } from "@/components/saved-videos";
import { WATCH_LATER_KEY } from "@/lib/constants";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Watch later",
  description: "Videos saved for later on this device.",
};

export default async function WatchLaterPage() {
  const { videos, failed } = await getSiteData();

  if (failed && videos.length === 0) {
    return <FeedError />;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <h1 className="px-3 text-xl font-semibold tracking-tight sm:px-0">
        Watch later
      </h1>
      <SavedVideos
        videos={videos}
        storageKey={WATCH_LATER_KEY}
        title="Watch later"
        emptyTitle="Nothing saved yet"
        emptyDescription="Use Save on a video to keep it here on this device."
      />
    </div>
  );
}
