import type { Metadata } from "next";
import { Clapperboard } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { FeedError } from "@/components/feed-states";
import { ShortsPlayer } from "@/components/shorts-player";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Shorts",
  description: "Short vertical videos from OurTube creators.",
};

export default async function ShortsPage() {
  const { shorts, channels, failed } = await getSiteData();

  if (failed && channels.length === 0) {
    return <FeedError />;
  }

  if (shorts.length === 0) {
    return (
      <EmptyState
        icon={<Clapperboard className="h-10 w-10" />}
        title="No Shorts yet"
        description="Videos under a minute will show up here."
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
        >
          Go home
        </Link>
      </EmptyState>
    );
  }

  return <ShortsPlayer shorts={shorts} />;
}
