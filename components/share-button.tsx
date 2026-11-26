"use client";

import { Share2 } from "lucide-react";

import { shareLink } from "@/lib/share";
import { cn } from "@/lib/utils";

type ShareButtonProps = {
  title: string;
  url: string;
  className?: string;
  tone?: "default" | "inverse";
};

export function ShareButton({ title, url, className, tone = "default" }: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={() => shareLink({ title, url })}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
        tone === "inverse"
          ? "border-white/40 text-white hover:bg-white/15"
          : "border-border hover:bg-surface",
        className,
      )}
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      Share
    </button>
  );
}
