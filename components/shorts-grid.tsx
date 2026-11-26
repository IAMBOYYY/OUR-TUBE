import { Clapperboard } from "lucide-react";
import Link from "next/link";

import { MediaImage } from "@/components/media-image";
import type { VideoWithChannel } from "@/lib/types";
import { shortHref } from "@/lib/utils";

export function ShortsGrid({
  shorts,
  className = "grid-cols-3",
}: {
  shorts: VideoWithChannel[];
  className?: string;
}) {
  return (
    <div className={`grid gap-1.5 sm:gap-2 ${className}`}>
      {shorts.map((short) => (
        <Link
          key={`${short.owner}/${short.repo}/${short.id}`}
          href={shortHref(short.owner, short.repo, short.id)}
          className="relative aspect-[9/16] overflow-hidden rounded-lg border border-border bg-black"
        >
          {short.thumbnail ? (
            <MediaImage
              src={short.thumbnail}
              alt=""
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-white/50">
              <Clapperboard className="h-7 w-7" aria-hidden="true" />
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1.5 py-1.5 text-[11px] font-medium leading-4 text-white">
            <span className="line-clamp-2">{short.title}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
