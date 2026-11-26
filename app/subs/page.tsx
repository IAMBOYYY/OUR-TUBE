import type { Metadata } from "next";

import { FeedError } from "@/components/feed-states";
import { SubsFeed } from "@/components/subs-feed";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Latest videos from channels you follow on this device.",
};

export default async function SubsPage() {
  const { channels, videos, failed } = await getSiteData();

  if (failed && channels.length === 0) {
    return <FeedError />;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <h1 className="px-3 text-xl font-semibold tracking-tight sm:px-0">Subs</h1>
      <SubsFeed channels={channels} videos={videos} />
    </div>
  );
}
