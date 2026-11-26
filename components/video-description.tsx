"use client";

import Link from "next/link";
import { useState } from "react";

import { BottomSheet } from "@/components/bottom-sheet";

type VideoDescriptionProps = {
  description: string;
  tags: string[];
  dateLabel: string;
};

export function VideoDescription({ description, tags, dateLabel }: VideoDescriptionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl bg-surface p-3">
        <p
          className="line-clamp-2 whitespace-pre-line text-sm leading-6"
          suppressHydrationWarning
        >
          {description || "No description was provided."}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span suppressHydrationWarning>{dateLabel}</span>
          {tags.slice(0, 4).map((tag) => (
            <Link
              key={tag}
              href={`/results?q=${encodeURIComponent(tag)}`}
              className="font-medium text-foreground hover:underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 text-sm font-medium hover:underline"
        >
          ...more
        </button>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Description">
        <div className="space-y-4 text-sm leading-6">
          <p className="whitespace-pre-line">
            {description || "No description was provided."}
          </p>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/results?q=${encodeURIComponent(tag)}`}
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted hover:text-foreground"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </BottomSheet>
    </>
  );
}
