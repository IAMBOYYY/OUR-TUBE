"use client";

import { ThumbsUp } from "lucide-react";

import { LIKED_KEY } from "@/lib/constants";
import { useIsInList, toggleInList } from "@/lib/local-store";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  targetKey: string;
  className?: string;
  tone?: "default" | "inverse";
};

export function LikeButton({ targetKey, className, tone = "default" }: LikeButtonProps) {
  const liked = useIsInList(LIKED_KEY, targetKey);

  return (
    <button
      type="button"
      onClick={() => toggleInList(LIKED_KEY, targetKey)}
      aria-pressed={liked}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
        tone === "inverse"
          ? "border-white/40 text-white hover:bg-white/15"
          : "border-border hover:bg-surface",
        className,
      )}
    >
      <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} aria-hidden="true" />
      {liked ? "Liked" : "Like"}
    </button>
  );
}
