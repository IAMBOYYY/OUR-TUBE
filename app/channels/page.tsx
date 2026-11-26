import type { Metadata } from "next";
import { Tv } from "lucide-react";

import { ChannelRow } from "@/components/channel-row";
import { EmptyState } from "@/components/empty-state";
import { FeedError } from "@/components/feed-states";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Channels",
  description: "Browse channels published on GitHub through OurTube.",
};

export default async function ChannelsPage() {
  const { channels, failed } = await getSiteData();

  if (failed && channels.length === 0) {
    return <FeedError />;
  }

  const sorted = [...channels].sort((a, b) => {
    if (b.stars !== a.stars) {
      return b.stars - a.stars;
    }

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <h1 className="text-xl font-semibold tracking-tight">Channels</h1>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Tv className="h-10 w-10" />}
          title="No channels right now"
          description="New channels show up here after they add the openyoutube-channel topic."
        />
      ) : (
        <div className="mt-2">
          {sorted.map((channel) => (
            <ChannelRow
              key={`${channel.owner}/${channel.repo}`}
              channel={channel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
