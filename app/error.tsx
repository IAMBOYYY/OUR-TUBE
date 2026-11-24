"use client";

import { VideoOff } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <VideoOff className="h-10 w-10 text-muted" aria-hidden="true" />
      <h1 className="mt-4 text-xl font-semibold tracking-tight">
        Something went wrong.
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        The page could not be loaded. Try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
      >
        Try again
      </button>
    </div>
  );
}
