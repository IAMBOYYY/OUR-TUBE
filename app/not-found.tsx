import Link from "next/link";

import { ArrowLeftIcon, PlayIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-rose-500 to-amber-400 text-white shadow-xl shadow-rose-500/20">
        <PlayIcon className="ml-1 h-7 w-7" />
      </span>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-primary">
        404 · Off air
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
        This channel or video is not here.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
        The repository may have removed its channel files, lost the topic, or
        changed its default branch. Try discovering something else.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to discovery
      </Link>
    </div>
  );
}
