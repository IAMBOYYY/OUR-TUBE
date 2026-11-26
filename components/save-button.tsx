"use client";

import { Bookmark } from "lucide-react";

import { showToast } from "@/components/toast-host";
import { WATCH_LATER_KEY } from "@/lib/constants";
import { useIsInList, toggleInList } from "@/lib/local-store";
import { cn } from "@/lib/utils";

type SaveButtonProps = {
  targetKey: string;
  className?: string;
  tone?: "default" | "inverse";
};

export function SaveButton({ targetKey, className, tone = "default" }: SaveButtonProps) {
  const saved = useIsInList(WATCH_LATER_KEY, targetKey);

  return (
    <button
      type="button"
      onClick={() => {
        const nowSaved = toggleInList(WATCH_LATER_KEY, targetKey);
        showToast(nowSaved ? "Saved to Watch later" : "Removed from Watch later");
      }}
      aria-pressed={saved}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
        tone === "inverse"
          ? "border-white/40 text-white hover:bg-white/15"
          : "border-border hover:bg-surface",
        className,
      )}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-current")} aria-hidden="true" />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
