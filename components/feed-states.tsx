"use client";

import { VideoOff } from "lucide-react";

import { useSearch } from "@/components/search-provider";
import { RefreshButton } from "@/components/refresh-button";

export function FeedEmpty() {
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <VideoOff className="h-10 w-10 text-muted" aria-hidden="true" />
      <h1 className="mt-4 text-lg font-semibold">No videos right now</h1>
      <p className="mt-2 text-sm text-muted">
        Check back soon. New videos show up here.
      </p>
      <RefreshButton />
    </div>
  );
}

export function FeedError() {
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <VideoOff className="h-10 w-10 text-muted" aria-hidden="true" />
      <h1 className="mt-4 text-lg font-semibold">Couldn&apos;t load videos</h1>
      <p className="mt-2 text-sm text-muted">Try again.</p>
      <RefreshButton />
    </div>
  );
}

export function NoResults() {
  const { reset } = useSearch();

  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <VideoOff className="h-10 w-10 text-muted" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold">No videos found</h2>
      <p className="mt-2 text-sm text-muted">
        Try a different search or filter.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
      >
        Clear filters
      </button>
    </div>
  );
}
