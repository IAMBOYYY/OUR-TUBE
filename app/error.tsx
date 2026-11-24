"use client";

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
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
        Transmission interrupted
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
        Something went wrong.
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-muted">
        The discovery feed could not be loaded. This is usually temporary.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-rose-500/20 transition hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
