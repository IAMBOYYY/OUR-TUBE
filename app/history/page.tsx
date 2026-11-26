import type { Metadata } from "next";

import { FeedError } from "@/components/feed-states";
import { SavedVideos } from "@/components/saved-videos";
import { HISTORY_KEY } from "@/lib/constants";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "History",
  description: "Videos you watched on this device.",
};

export default async function HistoryPage() {
  const { videos, failed } = await getSiteData();

  if (failed && videos.length === 0) {
    return <FeedError />;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <h1 className="px-3 text-xl font-semibold tracking-tight sm:px-0">History</h1>
      <SavedVideos
        videos={videos}
        storageKey={HISTORY_KEY}
        title="History"
        emptyTitle="No history yet"
        emptyDescription="Videos you watch will show up here on this device."
      />
    </div>
  );
}
