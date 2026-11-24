import { VideoOff } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <VideoOff className="h-10 w-10 text-muted" aria-hidden="true" />
      <p className="mt-4 text-xs font-medium uppercase tracking-widest text-muted">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">
        This channel or video is not here.
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        The repository may have removed its channel files, lost the topic, or
        changed its default branch.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
      >
        Go home
      </Link>
    </div>
  );
}
