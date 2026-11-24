import type { Metadata } from "next";

import { FeedEmpty, FeedError } from "@/components/feed-states";
import { HomeFeed } from "@/components/home-feed";
import { getAllVideosResult } from "@/lib/github";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Browse independent videos and music from creators publishing openly on GitHub.",
};

export default async function HomePage() {
  const { videos, failed } = await getAllVideosResult();

  if (failed) {
    return <FeedError />;
  }

  if (videos.length === 0) {
    return <FeedEmpty />;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <HomeFeed videos={videos} />
    </div>
  );
}
