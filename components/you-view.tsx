"use client";

import {
  Clock,
  History,
  ListVideo,
  ThumbsUp,
  User,
} from "lucide-react";
import Link from "next/link";

import { HistoryRow } from "@/components/history-row";
import {
  FOLLOWING_KEY,
  HISTORY_KEY,
  LIKED_KEY,
  WATCH_LATER_KEY,
} from "@/lib/constants";
import { useLocalList } from "@/lib/local-store";
import type { VideoWithChannel } from "@/lib/types";

export function YouView({ videos }: { videos: VideoWithChannel[] }) {
  const following = useLocalList(FOLLOWING_KEY);
  const liked = useLocalList(LIKED_KEY);
  const watchLater = useLocalList(WATCH_LATER_KEY);
  const history = useLocalList(HISTORY_KEY);

  const rows = [
    {
      href: "/history",
      label: "History",
      icon: <History className="h-5 w-5" />,
      count: history.length,
    },
    {
      href: "/watch-later",
      label: "Watch later",
      icon: <Clock className="h-5 w-5" />,
      count: watchLater.length,
    },
    {
      href: "/liked",
      label: "Liked videos",
      icon: <ThumbsUp className="h-5 w-5" />,
      count: liked.length,
    },
    {
      href: "/subs",
      label: "Subscriptions",
      icon: <ListVideo className="h-5 w-5" />,
      count: following.length,
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-border bg-surface text-muted">
          <User className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">You</h1>
          <p className="text-sm text-muted">@this-device</p>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-border px-3 py-2 text-xs leading-5 text-muted">
        Your data is saved on this device only.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/create"
          className="inline-flex min-h-11 items-center rounded-full border border-border bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Create a channel
        </Link>
        <Link
          href="/channels"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
        >
          Browse channels
        </Link>
      </div>

      <HistoryRow videos={videos} />

      <section aria-label="Library" className="mt-8">
        <h2 className="px-3 text-base font-semibold sm:px-0">Library</h2>
        <div className="mt-2">
          {rows.map((row) => (
            <Link
              key={row.href}
              href={row.href}
              className="flex min-h-14 items-center gap-3 border-b border-border py-2 transition-colors hover:bg-surface"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-muted">
                {row.icon}
              </span>
              <span className="flex-1 text-sm font-medium">{row.label}</span>
              <span className="text-sm text-muted">{row.count}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
