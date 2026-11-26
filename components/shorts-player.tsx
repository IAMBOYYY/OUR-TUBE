"use client";

import {
  Bookmark,
  Clapperboard,
  MessageCircle,
  Share2,
  ThumbsUp,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { MediaImage } from "@/components/media-image";
import { SubscribeButton } from "@/components/subscribe-button";
import {
  LIKED_KEY,
  WATCH_LATER_KEY,
} from "@/lib/constants";
import { useIsInList, toggleInList } from "@/lib/local-store";
import { shareLink } from "@/lib/share";
import type { VideoWithChannel } from "@/lib/types";
import {
  channelHref,
  cn,
  discussionsUrl,
  formatSubscribers,
  shortHref,
  videoKey,
} from "@/lib/utils";

type ShortsPlayerProps = {
  shorts: VideoWithChannel[];
  initialKey?: string;
};

export function ShortsPlayer({ shorts, initialKey }: ShortsPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const initialIndex = Math.max(
    0,
    shorts.findIndex(
      (short) => `${short.owner}/${short.repo}/${short.id}` === initialKey,
    ),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const root = containerRef.current;

    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number((entry.target as HTMLElement).dataset.index);

            if (Number.isFinite(index)) {
              setActiveIndex(index);
            }
          }
        }
      },
      { root, threshold: [0.6, 0.9] },
    );

    for (const item of itemRefs.current) {
      if (item) {
        observer.observe(item);
      }
    }

    return () => observer.disconnect();
  }, [shorts.length]);

  useEffect(() => {
    if (initialIndex <= 0) {
      return;
    }

    const target = itemRefs.current[initialIndex];

    if (target) {
      target.scrollIntoView({ block: "start" });
    }
  }, [initialIndex]);

  useEffect(() => {
    const short = shorts[activeIndex];

    if (!short) {
      return;
    }

    window.history.replaceState(
      null,
      "",
      shortHref(short.owner, short.repo, short.id),
    );
  }, [activeIndex, shorts]);

  if (shorts.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-black">
      <button
        type="button"
        onClick={() => setMuted((value) => !value)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute right-3 top-3 z-30 grid h-11 w-11 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div
        ref={containerRef}
        className="h-[calc(100dvh-9.6rem)] snap-y snap-mandatory overflow-y-scroll md:h-[calc(100dvh-6.1rem)]"
      >
        {shorts.map((short, index) => (
          <div
            key={`${short.owner}/${short.repo}/${short.id}`}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            data-index={index}
            className="relative h-full snap-start overflow-hidden bg-black"
          >
            <ShortItem short={short} active={index === activeIndex} muted={muted} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ShortItem({
  short,
  active,
  muted,
}: {
  short: VideoWithChannel;
  active: boolean;
  muted: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const key = videoKey(short.owner, short.repo, short.id);
  const liked = useIsInList(LIKED_KEY, key);
  const saved = useIsInList(WATCH_LATER_KEY, key);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    element.muted = muted;
  }, [muted]);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (active) {
      element.play().catch(() => {
        element.muted = true;
        element.play().catch(() => undefined);
      });
    } else {
      element.pause();
      element.currentTime = 0;
      setProgress(0);
      setPaused(false);
    }
  }, [active]);

  function togglePlay(event: MouseEvent<HTMLVideoElement>) {
    event.stopPropagation();
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (element.paused) {
      element.play().catch(() => undefined);
      setPaused(false);
    } else {
      element.pause();
      setPaused(true);
    }
  }

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        src={short.videoUrl}
        poster={short.thumbnail}
        loop
        playsInline
        muted={muted}
        preload="metadata"
        onClick={togglePlay}
        onTimeUpdate={(event) => {
          const element = event.currentTarget;

          if (Number.isFinite(element.duration) && element.duration > 0) {
            setProgress((element.currentTime / element.duration) * 100);
          }
        }}
        onPause={() => setPaused(true)}
        onPlay={() => setPaused(false)}
        aria-label={short.title}
        className="h-full w-full bg-black object-contain"
      />

      {paused ? (
        <span className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-black/50 text-white">
            <Clapperboard className="h-7 w-7" aria-hidden="true" />
          </span>
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/25">
        <div
          className="h-full bg-accent"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 pb-5">
        <div className="pointer-events-auto min-w-0 flex-1">
          <Link
            href={channelHref(short.owner, short.repo)}
            className="flex items-center gap-2"
          >
            <MediaImage
              src={short.channelLogo}
              alt=""
              className="h-9 w-9 rounded-full border border-white/30"
            />
            <span className="truncate text-sm font-medium text-white">
              @{short.owner}
            </span>
          </Link>

          <p className="mt-0.5 text-xs text-white/70">
            {formatSubscribers(short.stars)}
          </p>

          <div className="mt-2">
            <SubscribeButton
              owner={short.owner}
              repo={short.repo}
              size="sm"
              tone="inverse"
            />
          </div>

          <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-white">
            {short.title}
          </p>
        </div>

        <div className="pointer-events-auto flex shrink-0 flex-col items-center gap-3 pb-1">
          <ShortAction
            label="Like"
            active={liked}
            onClick={() => toggleInList(LIKED_KEY, key)}
          >
            <ThumbsUp className="h-6 w-6" />
          </ShortAction>

          <ShortAction
            label="Save"
            active={saved}
            onClick={() => toggleInList(WATCH_LATER_KEY, key)}
          >
            <Bookmark className="h-6 w-6" />
          </ShortAction>

          <ShortAction
            label="Share"
            onClick={() =>
              shareLink({
                title: short.title,
                url: shortHref(short.owner, short.repo, short.id),
              })
            }
          >
            <Share2 className="h-6 w-6" />
          </ShortAction>

          {short.hasDiscussions ? (
            <a
              href={discussionsUrl(short.owner, short.repo)}
              target="_blank"
              rel="noreferrer"
              aria-label="Discuss on GitHub"
              className="grid h-11 w-11 place-items-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <MessageCircle className="h-6 w-6" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ShortAction({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={label === "Like" || label === "Save" ? active : undefined}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70",
        active && "[&_svg]:fill-current",
      )}
    >
      {children}
    </button>
  );
}
