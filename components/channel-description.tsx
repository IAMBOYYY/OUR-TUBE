"use client";

import { ExternalLink, GitBranch } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BottomSheet } from "@/components/bottom-sheet";
import type { Channel } from "@/lib/types";
import {
  formatCount,
  formatMonthYear,
  formatSubscribers,
} from "@/lib/utils";

export function ChannelDescription({ channel }: { channel: Channel }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-3 flex min-w-0 items-baseline gap-1">
        <p className="line-clamp-1 min-w-0 text-sm text-muted">
          {channel.description || "No description yet."}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 text-sm font-medium text-foreground hover:underline"
        >
          ...more
        </button>
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Description / More info"
      >
        <div className="space-y-4 text-sm leading-6">
          <p className="whitespace-pre-line">
            {channel.description || "This channel has not added a description."}
          </p>

          <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div>
              <dt className="text-xs text-muted">Subscribers</dt>
              <dd className="mt-0.5 font-medium">
                {formatSubscribers(channel.stars)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Videos</dt>
              <dd className="mt-0.5 font-medium">{formatCount(channel.videos.length)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Joined</dt>
              <dd className="mt-0.5 font-medium">
                {channel.createdAt
                  ? formatMonthYear(channel.createdAt)
                  : "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Channel</dt>
              <dd className="mt-0.5 truncate font-medium">
                @{channel.owner}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Link
              href={channel.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
            >
              <GitBranch className="h-4 w-4" aria-hidden="true" />
              {channel.owner}/{channel.repo}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
