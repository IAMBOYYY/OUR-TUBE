"use client";

import { Clapperboard, MoreVertical, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { MediaImage } from "@/components/media-image";
import { shareLink } from "@/lib/share";
import type { VideoWithChannel } from "@/lib/types";
import { shortHref } from "@/lib/utils";

export function ShortsRow({ shorts }: { shorts: VideoWithChannel[] }) {
  if (shorts.length === 0) {
    return null;
  }

  return (
    <section aria-label="Shorts" className="px-3 py-2 sm:px-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Clapperboard className="h-5 w-5 text-accent" aria-hidden="true" />
          Shorts
        </h2>
        <ShortsRowMenu />
      </div>

      <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:px-0">
        {shorts.map((short) => (
          <Link
            key={`${short.owner}/${short.repo}/${short.id}`}
            href={shortHref(short.owner, short.repo, short.id)}
            className="group relative aspect-[9/16] w-36 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-black sm:w-40"
          >
            {short.thumbnail ? (
              <MediaImage
                src={short.thumbnail}
                alt=""
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-white/50">
                <Clapperboard className="h-8 w-8" aria-hidden="true" />
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-2 text-xs font-medium leading-4 text-white">
              <span className="line-clamp-2">{short.title}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ShortsRowMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Shorts options"
        aria-expanded={open}
        className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border border-border bg-background py-1"
        >
          <Link
            href="/shorts"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-surface"
          >
            <Clapperboard className="h-4 w-4" />
            Open Shorts
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await shareLink({ title: "Shorts on OurTube", url: "/shorts" });
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      ) : null}
    </div>
  );
}
