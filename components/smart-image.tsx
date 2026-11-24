"use client";

import { useState } from "react";

import { PlayIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  loading?: "lazy" | "eager";
};

export function SmartImage({
  src,
  alt,
  className,
  imageClassName,
  fallbackClassName,
  loading = "lazy",
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={cn("relative block overflow-hidden", className)}>
      {failed ? (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-500/20 via-card to-amber-500/20",
            fallbackClassName,
          )}
        >
          <PlayIcon className="h-8 w-8 text-primary/50" />
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
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
