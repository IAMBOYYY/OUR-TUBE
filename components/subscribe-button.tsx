"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { BottomSheet } from "@/components/bottom-sheet";
import { FOLLOWING_KEY } from "@/lib/constants";
import { useIsInList, toggleInList, writeLocalValue } from "@/lib/local-store";
import { cn, githubRepoUrl } from "@/lib/utils";

type SubscribeButtonProps = {
  owner: string;
  repo: string;
  className?: string;
  size?: "sm" | "md";
  tone?: "default" | "inverse";
};

export function SubscribeButton({
  owner,
  repo,
  className,
  size = "md",
  tone = "default",
}: SubscribeButtonProps) {
  const channelKey = `${owner}/${repo}`;
  const following = useIsInList(FOLLOWING_KEY, channelKey);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetKey = `ourtube:subscribed-sheet:${channelKey}`;

  function handleClick() {
    const nowFollowing = toggleInList(FOLLOWING_KEY, channelKey);

    if (!nowFollowing) {
      return;
    }

    try {
      if (window.localStorage.getItem(sheetKey)) {
        return;
      }

      window.localStorage.setItem(sheetKey, "1");
    } catch {
      return;
    }

    setSheetOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={following}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border font-medium transition-colors",
          size === "sm" ? "min-h-9 px-3 text-xs" : "min-h-11 px-4 text-sm",
          tone === "inverse"
            ? following
              ? "border-white/40 bg-white/15 text-white hover:bg-white/25"
              : "border-white bg-white text-black hover:bg-white/90"
            : following
              ? "border-border bg-surface text-muted hover:text-foreground"
              : "border-border bg-foreground text-background hover:opacity-90",
          className,
        )}
      >
        {following ? "Subscribed" : "Subscribe"}
      </button>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Subscribed"
      >
        <p className="text-sm leading-6 text-muted">
          Subscribed on this device. To be counted publicly, star this channel on
          GitHub.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            href={githubRepoUrl(owner, repo)}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              writeLocalValue(sheetKey, "1");
              setSheetOpen(false);
            }}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Star className="h-4 w-4" aria-hidden="true" />
            Star on GitHub
          </a>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
          >
            Close
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
