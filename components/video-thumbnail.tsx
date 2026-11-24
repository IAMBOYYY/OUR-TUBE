"use client";

import { Play } from "lucide-react";
import { useState } from "react";

import type { Video } from "@/lib/types";
import { cn } from "@/lib/utils";

type ThumbnailMode = "image" | "frame" | "placeholder";

type VideoThumbnailProps = {
  video: Video;
  className?: string;
  allowVideoFallback?: boolean;
  showDuration?: boolean;
};

export function VideoThumbnail({
  video,
  className,
  allowVideoFallback = true,
  showDuration = true,
}: VideoThumbnailProps) {
  const canUseFrame = allowVideoFallback && video.type === "video";
  const [mode, setMode] = useState<ThumbnailMode>(
    video.thumbnail ? "image" : canUseFrame ? "frame" : "placeholder",
  );

  function fallbackFromImage() {
    setMode(canUseFrame ? "frame" : "placeholder");
  }

  const frameUrl = video.videoUrl.includes("#")
    ? video.videoUrl
    : `${video.videoUrl}#t=0.5`;

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden bg-surface",
        className,
      )}
    >
      {mode === "image" && video.thumbnail ? (
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          onError={fallbackFromImage}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {mode === "frame" ? (
        <video
          src={frameUrl}
          preload="metadata"
          muted
          playsInline
          tabIndex={-1}
          aria-hidden="true"
          onLoadedMetadata={(event) => {
            const element = event.currentTarget;

            if (Number.isFinite(element.duration) && element.duration > 0) {
              element.currentTime = Math.min(0.5, element.duration);
            }
          }}
          onError={() => setMode("placeholder")}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {mode === "placeholder" ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted">
          <Play className="h-8 w-8" aria-hidden="true" />
        </div>
      ) : null}

      {showDuration && video.duration ? (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-0.5 text-[11px] font-medium leading-none text-white">
          {video.duration}
        </span>
      ) : null}
    </div>
  );
}
