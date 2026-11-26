"use client";

import { Bookmark, Flag, MoreVertical, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { showToast } from "@/components/toast-host";
import { WATCH_LATER_KEY } from "@/lib/constants";
import { useIsInList, toggleInList } from "@/lib/local-store";
import { shareLink } from "@/lib/share";
import type { VideoWithChannel } from "@/lib/types";
import { reportIssueUrl, videoKey, watchHref } from "@/lib/utils";

type VideoMenuProps = {
  video: VideoWithChannel;
  align?: "left" | "right";
};

export function VideoMenu({ video, align = "right" }: VideoMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const key = videoKey(video.owner, video.repo, video.id);
  const saved = useIsInList(WATCH_LATER_KEY, key);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggleSaved() {
    const nowSaved = toggleInList(WATCH_LATER_KEY, key);
    showToast(nowSaved ? "Saved to Watch later" : "Removed from Watch later");
    setOpen(false);
  }

  async function handleShare() {
    setOpen(false);
    await shareLink({
      title: video.title,
      url: watchHref(video.owner, video.repo, video.id),
    });
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="More options"
        aria-expanded={open}
        className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute top-full z-30 mt-1 w-56 rounded-lg border border-border bg-background py-1 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <button
            type="button"
            role="menuitem"
            onClick={toggleSaved}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface"
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
            {saved ? "Remove from Watch later" : "Save to Watch later"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleShare}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <a
            role="menuitem"
            href={reportIssueUrl(video.owner, video.repo, video.id)}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface"
          >
            <Flag className="h-4 w-4" />
            Report
          </a>
        </div>
      ) : null}
    </div>
  );
}
