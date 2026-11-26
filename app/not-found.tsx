import { Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <Compass className="h-10 w-10 text-muted" aria-hidden="true" />
      <p className="mt-4 text-xs font-medium uppercase tracking-widest text-muted">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">
        This page is not here.
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        The channel may have removed its files, lost the topic, or changed its
        default branch.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-border bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/channels"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
        >
          Browse channels
        </Link>
      </div>
    </div>
  );
}
