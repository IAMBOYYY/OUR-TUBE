"use client";

import { Music } from "lucide-react";
import { useRef, useState } from "react";

import { MediaImage } from "@/components/media-image";
import { HISTORY_KEY } from "@/lib/constants";
import { addToList } from "@/lib/local-store";
import type { VideoWithChannel } from "@/lib/types";
import { videoKey } from "@/lib/utils";

export function MusicPlayer({ video }: { video: VideoWithChannel }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const addedRef = useRef(false);
  const [error, setError] = useState(false);
  const key = videoKey(video.owner, video.repo, video.id);

  return (
    <div className="bg-black">
      <div className="flex flex-col items-center gap-5 px-4 py-8">
        <div className="relative w-full max-w-sm">
          <MediaImage
            src={video.thumbnail ?? ""}
            alt=""
            className="aspect-square w-full rounded-xl border border-neutral-800"
          />
          <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white">
            <Music className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        <div className="w-full max-w-xl">
          {error ? (
            <p className="text-center text-sm text-white/70">
              This audio cannot play here.{" "}
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-white underline"
              >
                Open file directly
              </a>
            </p>
          ) : (
            <audio
              ref={audioRef}
              controls
              preload="metadata"
              onPlay={() => {
                if (!addedRef.current) {
                  addedRef.current = true;
                  addToList(HISTORY_KEY, key, 200);
                }
              }}
              onError={() => setError(true)}
              aria-label={`${video.title} audio player`}
              className="w-full"
            >
              <source src={video.videoUrl} />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      </div>
    </div>
  );
}
