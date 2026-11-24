"use client";

import { Play } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type MediaImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function MediaImage({
  src,
  alt,
  className,
  imageClassName,
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn(
        "relative block overflow-hidden bg-surface",
        className,
      )}
    >
      {failed ? (
        <span className="absolute inset-0 flex items-center justify-center text-muted">
          <Play className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            imageClassName,
          )}
        />
      )}
    </span>
  );
}
