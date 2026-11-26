"use client";

import {
  Captions,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import {
  AUTOPLAY_NEXT_KEY,
  HISTORY_KEY,
  PLAYER_CAPTIONS_KEY,
  PLAYER_QUALITY_KEY,
  PLAYER_SPEED_KEY,
} from "@/lib/constants";
import { addToList } from "@/lib/local-store";
import type { Caption, VideoSource, VideoWithChannel } from "@/lib/types";
import { cn, formatDuration, videoKey } from "@/lib/utils";

type VideoPlayerProps = {
  video: VideoWithChannel;
  nextHref?: string;
  nextTitle?: string;
};

type SettingsView = "main" | "quality" | "captions" | "speed";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function srtToVtt(input: string): string {
  const body = input
    .replace(/\r+/g, "")
    .replace(/^\uFEFF/, "")
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2")
    .replace(/^\d+\s*$/gm, "")
    .trim();

  return `WEBVTT\n\n${body}\n`;
}

function getConnection(): { saveData?: boolean; effectiveType?: string } | undefined {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
}

export function VideoPlayer({ video, nextHref, nextTitle }: VideoPlayerProps) {
  const router = useRouter();
  const key = videoKey(video.owner, video.repo, video.id);
  const resumeKey = `ourtube:resume:${key}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSrcRef = useRef<string | null>(null);
  const resumeAppliedRef = useRef(false);
  const historyAddedRef = useRef(false);
  const blobTrackRef = useRef<HTMLTrackElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const tapTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSeconds ?? 0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<SettingsView>("main");
  const [quality, setQuality] = useState("auto");
  const [captionLang, setCaptionLang] = useState("off");
  const [speed, setSpeed] = useState(1);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [autoHeight, setAutoHeight] = useState(480);
  const [seekFlash, setSeekFlash] = useState<{ direction: "back" | "forward"; id: number } | null>(null);
  const [pipSupported, setPipSupported] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const sources = useMemo<VideoSource[]>(() => {
    if (video.sources && video.sources.length > 0) {
      return video.sources;
    }

    return [{ label: "Original", url: video.videoUrl }];
  }, [video.sources, video.videoUrl]);

  const captions = useMemo<Caption[]>(() => video.captions ?? [], [video.captions]);

  const selectedSource = useMemo(() => {
    if (sources.length === 1) {
      return sources[0];
    }

    if (quality !== "auto") {
      return sources.find((source) => source.label === quality) ?? sources[0];
    }

    const connection = getConnection();
    let target = autoHeight || 480;

    if (connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") {
      target = 240;
    } else if (connection?.effectiveType === "3g") {
      target = Math.min(target, 480);
    }

    const sorted = [...sources].sort((a, b) => (a.height ?? 0) - (b.height ?? 0));
    let pick = sorted[0];

    for (const source of sorted) {
      if ((source.height ?? 0) <= target) {
        pick = source;
      }
    }

    return pick;
  }, [autoHeight, quality, sources]);

  const activeUrl = selectedSource.url;

  useEffect(() => {
    const stored = readStored(PLAYER_QUALITY_KEY);

    if (stored) {
      setQuality(stored);
    }

    const storedCaptions = readStored(PLAYER_CAPTIONS_KEY);

    if (storedCaptions) {
      setCaptionLang(storedCaptions);
    }

    const storedSpeed = Number(readStored(PLAYER_SPEED_KEY));

    if (Number.isFinite(storedSpeed) && storedSpeed >= 0.25 && storedSpeed <= 2) {
      setSpeed(storedSpeed);
    }

    const storedAutoplay = readStored(AUTOPLAY_NEXT_KEY);

    if (storedAutoplay !== null) {
      setAutoplayNext(storedAutoplay !== "0");
    }
  }, []);

  useEffect(() => {
    setPipSupported(Boolean(document.pictureInPictureEnabled));
  }, []);

  useEffect(() => {
    function update() {
      const element = containerRef.current;
      setAutoHeight(element?.clientHeight || 480);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (lastSrcRef.current === activeUrl) {
      return;
    }

    const isFirst = lastSrcRef.current === null;
    const previousTime = element.currentTime;
    const wasPlaying = !element.paused && !element.ended;
    lastSrcRef.current = activeUrl;
    setError(false);
    element.src = activeUrl;
    element.load();

    if (!isFirst) {
      const onLoaded = () => {
        try {
          if (Number.isFinite(previousTime) && previousTime > 0) {
            element.currentTime = Math.min(previousTime, element.duration || previousTime);
          }
        } catch {
          // Ignore seek errors on unsupported files.
        }

        if (wasPlaying) {
          element.play().catch(() => undefined);
        }

        element.removeEventListener("loadedmetadata", onLoaded);
      };

      element.addEventListener("loadedmetadata", onLoaded);
    }
  }, [activeUrl]);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    element.volume = volume;
    element.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    element.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (!playing || settingsOpen) {
      setShowControls(true);
      return;
    }

    const timer = window.setTimeout(() => setShowControls(false), 3000);
    return () => window.clearTimeout(timer);
  }, [lastInteraction, playing, settingsOpen]);

  useEffect(() => {
    function handleFullscreen() {
      setFullscreen(document.fullscreenElement === containerRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [settingsOpen]);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    for (const track of Array.from(element.textTracks)) {
      track.mode = "disabled";
    }

    if (blobTrackRef.current) {
      blobTrackRef.current.remove();
      blobTrackRef.current = null;
    }

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (captionLang === "off") {
      return;
    }

    const caption = captions.find((item) => item.lang === captionLang);

    if (!caption) {
      return;
    }

    const media = element;
    const activeCaption = caption;
    let cancelled = false;

    async function loadCaption() {
      try {
        const response = await fetch(activeCaption.url);

        if (!response.ok) {
          throw new Error("Caption request failed");
        }

        let text = await response.text();

        if (!text.trim().startsWith("WEBVTT")) {
          text = srtToVtt(text);
        }

        if (cancelled) {
          return;
        }

        const blob = new Blob([text], { type: "text/vtt" });
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        const track = document.createElement("track");
        track.kind = "captions";
        track.label = activeCaption.label;
        track.srclang = activeCaption.lang;
        track.src = url;
        track.default = true;
        media.appendChild(track);
        blobTrackRef.current = track;
        window.setTimeout(() => {
          if (cancelled) {
            return;
          }

          const list = media.textTracks;
          const last = list[list.length - 1];

          if (last) {
            last.mode = "showing";
          }
        }, 50);
      } catch {
        const native = Array.from(media.querySelectorAll("track")).find(
          (track) => track.srclang === activeCaption.lang && track !== blobTrackRef.current,
        );

        if (native?.track) {
          native.track.mode = "showing";
        }
      }
    }

    loadCaption();

    return () => {
      cancelled = true;
    };
  }, [captionLang, captions]);

  useEffect(() => {
    return () => {
      if (blobTrackRef.current) {
        blobTrackRef.current.remove();
      }

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      if (tapTimerRef.current) {
        window.clearTimeout(tapTimerRef.current);
      }

      if (countdownTimerRef.current) {
        window.clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const timer = window.setInterval(() => {
      saveResume();
    }, 5000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, resumeKey]);

  function saveResume() {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    try {
      const value = element.currentTime;

      if (Number.isFinite(value) && value > 5) {
        window.localStorage.setItem(resumeKey, String(value));
      }
    } catch {
      return;
    }
  }

  function reveal() {
    setShowControls(true);
    setLastInteraction((value) => value + 1);
  }

  function togglePlay() {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (element.paused) {
      element.play().catch(() => setError(true));
    } else {
      element.pause();
    }
  }

  function seekTo(value: number) {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    const max = Number.isFinite(element.duration) ? element.duration : duration;
    element.currentTime = Math.max(0, Math.min(value, max || value));
    setCurrentTime(element.currentTime);
  }

  function seekBy(delta: number) {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    seekTo(element.currentTime + delta);
    reveal();
  }

  function flashSeek(direction: "back" | "forward") {
    setSeekFlash({ direction, id: Date.now() });
    window.setTimeout(() => setSeekFlash(null), 550);
  }

  function handleSurfaceClick(event: ReactMouseEvent<HTMLVideoElement>) {
    const element = videoRef.current;
    const container = containerRef.current;

    if (!element || !container) {
      return;
    }

    if (!started) {
      setStarted(true);
      element.play().catch(() => setError(true));
      return;
    }

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const now = Date.now();
    const last = lastTapRef.current;

    if (last && now - last.time < 320 && Math.abs(x - last.x) < 90) {
      if (tapTimerRef.current) {
        window.clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }

      if (x < rect.width / 2) {
        seekBy(-10);
        flashSeek("back");
      } else {
        seekBy(10);
        flashSeek("forward");
      }

      lastTapRef.current = null;
      return;
    }

    lastTapRef.current = { time: now, x };
    tapTimerRef.current = window.setTimeout(() => {
      lastTapRef.current = null;
      setShowControls((value) => !value);
    }, 280);
  }

  function toggleMute() {
    setMuted((value) => !value);
  }

  function toggleFullscreen() {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      container.requestFullscreen().catch(() => undefined);
    }
  }

  function togglePip() {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => undefined);
    } else if (document.pictureInPictureEnabled) {
      element.requestPictureInPicture().catch(() => undefined);
    }
  }

  function changeQuality(value: string) {
    setQuality(value);
    store(PLAYER_QUALITY_KEY, value);
    setSettingsOpen(false);
    setSettingsView("main");
  }

  function changeCaption(value: string) {
    setCaptionLang(value);
    store(PLAYER_CAPTIONS_KEY, value);
    setSettingsOpen(false);
    setSettingsView("main");
  }

  function changeSpeed(value: number) {
    setSpeed(value);
    store(PLAYER_SPEED_KEY, String(value));
  }

  function toggleAutoplay() {
    const next = !autoplayNext;
    setAutoplayNext(next);
    store(AUTOPLAY_NEXT_KEY, next ? "1" : "0");
  }

  function cancelCountdown() {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setCountdown(null);
  }

  function startCountdown() {
    if (!nextHref) {
      return;
    }

    let remaining = 5;
    setCountdown(remaining);

    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = window.setInterval(() => {
      remaining -= 1;

      if (remaining <= 0) {
        if (countdownTimerRef.current) {
          window.clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }

        router.push(nextHref);
        return;
      }

      setCountdown(remaining);
    }, 1000);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      return;
    }

    const element = videoRef.current;

    if (!element) {
      return;
    }

    switch (event.key) {
      case " ":
      case "k":
        event.preventDefault();
        togglePlay();
        reveal();
        break;
      case "j":
        event.preventDefault();
        seekBy(-10);
        break;
      case "l":
        event.preventDefault();
        seekBy(10);
        break;
      case "ArrowLeft":
        event.preventDefault();
        seekBy(-5);
        break;
      case "ArrowRight":
        event.preventDefault();
        seekBy(5);
        break;
      case "ArrowUp":
        event.preventDefault();
        setVolume((value) => Math.min(1, Math.round((value + 0.05) * 100) / 100));
        setMuted(false);
        reveal();
        break;
      case "ArrowDown":
        event.preventDefault();
        setVolume((value) => Math.max(0, Math.round((value - 0.05) * 100) / 100));
        reveal();
        break;
      case "m":
        event.preventDefault();
        toggleMute();
        reveal();
        break;
      case "f":
        event.preventDefault();
        toggleFullscreen();
        break;
      case "c":
        event.preventDefault();
        changeCaption(captionLang === "off" ? captions[0]?.lang ?? "off" : "off");
        break;
      case "<":
        event.preventDefault();
        changeSpeed(Math.max(0.25, speed - 0.25));
        break;
      case ">":
        event.preventDefault();
        changeSpeed(Math.min(2, speed + 0.25));
        break;
      default:
        if (/^[0-9]$/.test(event.key) && duration > 0) {
          event.preventDefault();
          seekTo((Number(event.key) / 10) * duration);
          reveal();
        }
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const qualityOptions =
    sources.length > 1
      ? [{ value: "auto", label: "Auto" }, ...sources.map((source) => ({ value: source.label, label: source.label }))]
      : sources.map((source) => ({ value: source.label, label: "Original" }));
  const qualityLabel =
    sources.length === 1
      ? "Original"
      : quality === "auto"
        ? `Auto (${selectedSource.label})`
        : selectedSource.label;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerMove={reveal}
      className={cn(
        "group relative aspect-video w-full overflow-hidden bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        fullscreen && "aspect-auto h-screen",
      )}
      aria-label={`${video.title} player`}
    >
      <video
        ref={videoRef}
        poster={video.thumbnail}
        playsInline
        preload="metadata"
        onClick={handleSurfaceClick}
        onLoadedMetadata={(event) => {
          const element = event.currentTarget;

          if (Number.isFinite(element.duration) && element.duration > 0) {
            setDuration(element.duration);
          }

          if (!resumeAppliedRef.current) {
            resumeAppliedRef.current = true;

            try {
              const saved = Number(window.localStorage.getItem(resumeKey));

              if (
                Number.isFinite(saved) &&
                saved > 5 &&
                element.duration > 0 &&
                saved < element.duration * 0.95
              ) {
                element.currentTime = saved;
              }
            } catch {
              // Ignore resume errors.
            }
          }
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onProgress={(event) => {
          const element = event.currentTarget;

          if (element.buffered.length > 0) {
            setBuffered(element.buffered.end(element.buffered.length - 1));
          }
        }}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          cancelCountdown();

          if (!historyAddedRef.current) {
            historyAddedRef.current = true;
            addToList(HISTORY_KEY, key, 200);
          }
        }}
        onPause={() => {
          setPlaying(false);
          saveResume();
        }}
        onEnded={() => {
          setPlaying(false);
          saveResume();

          if (autoplayNext && nextHref) {
            startCountdown();
          }
        }}
        onError={() => setError(true)}
        className="h-full w-full bg-black object-contain"
      >
        {captions.map((caption) => (
          <track
            key={`${caption.lang}-${caption.url}`}
            kind="captions"
            src={caption.url}
            srcLang={caption.lang}
            label={caption.label}
          />
        ))}
      </video>

      {error ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/90 p-6 text-center">
          <div>
            <p className="text-base font-semibold">This video cannot play here.</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
              The link must contain /releases/download/. Open the file directly if
              the browser still refuses it.
            </p>
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center rounded-full border border-white/40 px-4 text-sm font-medium transition-colors hover:bg-white/15"
            >
              Open file directly
            </a>
          </div>
        </div>
      ) : null}

      {!started && !error ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setStarted(true);
            videoRef.current?.play().catch(() => setError(true));
          }}
          aria-label="Play video"
          className="absolute inset-0 grid place-items-center bg-black/30"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-black">
            <Play className="ml-0.5 h-7 w-7 fill-current" />
          </span>
        </button>
      ) : null}

      {seekFlash ? (
        <div
          key={seekFlash.id}
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold",
            seekFlash.direction === "back" ? "left-6" : "right-6",
          )}
        >
          {seekFlash.direction === "back" ? "-10s" : "+10s"}
        </div>
      ) : null}

      {countdown !== null ? (
        <div className="absolute inset-0 grid place-items-center bg-black/75 p-4 text-center">
          <div>
            <p className="text-sm text-white/70">Up next</p>
            <p className="mt-1 text-base font-semibold">{nextTitle}</p>
            <p className="mt-2 text-sm text-white/70">Playing in {countdown}s</p>
            <button
              type="button"
              onClick={cancelCountdown}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 px-4 text-sm font-medium transition-colors hover:bg-white/15"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div
          ref={settingsRef}
          className="absolute bottom-20 right-2 z-30 max-h-[70%] w-64 overflow-y-auto rounded-xl border border-white/20 bg-black/95 p-2 text-sm"
        >
          {settingsView === "main" ? (
            <div className="space-y-0.5">
              <SettingsRow
                label="Quality"
                value={qualityLabel}
                onClick={() => setSettingsView("quality")}
              />
              <SettingsRow
                label="Captions"
                value={
                  captionLang === "off"
                    ? "Off"
                    : captions.find((item) => item.lang === captionLang)?.label ?? captionLang
                }
                onClick={() => setSettingsView("captions")}
              />
              <SettingsRow
                label="Speed"
                value={`${speed}x`}
                onClick={() => setSettingsView("speed")}
              />
              {nextHref ? (
                <button
                  type="button"
                  onClick={toggleAutoplay}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/10"
                >
                  <span>Autoplay next</span>
                  <span className="text-xs text-white/70">{autoplayNext ? "On" : "Off"}</span>
                </button>
              ) : null}
            </div>
          ) : null}

          {settingsView === "quality" ? (
            <div>
              <SettingsBack onClick={() => setSettingsView("main")} label="Quality" />
              {qualityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => changeQuality(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/10",
                    (quality === option.value || (sources.length === 1 && option.value === sources[0].label)) &&
                      "font-semibold",
                  )}
                >
                  <span>{option.label}</span>
                  {(quality === option.value || (sources.length === 1 && option.value === sources[0].label)) && (
                    <span aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
          ) : null}

          {settingsView === "captions" ? (
            <div>
              <SettingsBack onClick={() => setSettingsView("main")} label="Captions" />
              {[{ lang: "off", label: "Off" }, ...captions].map((option) => (
                <button
                  key={option.lang}
                  type="button"
                  onClick={() => changeCaption(option.lang)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/10",
                    captionLang === option.lang && "font-semibold",
                  )}
                >
                  <span>{option.label}</span>
                  {captionLang === option.lang && <span aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          ) : null}

          {settingsView === "speed" ? (
            <div>
              <SettingsBack onClick={() => setSettingsView("main")} label="Speed" />
              {SPEEDS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => changeSpeed(option)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/10",
                    speed === option && "font-semibold",
                  )}
                >
                  <span>{option === 1 ? "Normal" : `${option}x`}</span>
                  {speed === option && <span aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-black/80 px-2 pb-1.5 pt-2 transition-opacity duration-200",
          showControls || !playing ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-1.5 w-full">
          <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-white/25" />
          <div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-white/40"
            style={{ width: `${Math.min(100, bufferedPercent)}%` }}
          />
          <div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-accent"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(event) => seekTo(Number(event.target.value))}
            aria-label="Seek"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="mt-1 flex items-center gap-1">
          <ControlButton label={playing ? "Pause" : "Play"} onClick={togglePlay}>
            {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </ControlButton>
          <ControlButton
            label="Back 10 seconds"
            onClick={() => seekBy(-10)}
            className="max-sm:hidden"
          >
            <RotateCcw className="h-4 w-4" />
          </ControlButton>
          <ControlButton
            label="Forward 10 seconds"
            onClick={() => seekBy(10)}
            className="max-sm:hidden"
          >
            <RotateCw className="h-4 w-4" />
          </ControlButton>
          <ControlButton label={muted ? "Unmute" : "Mute"} onClick={toggleMute}>
            {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </ControlButton>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(event) => {
              setVolume(Number(event.target.value));
              setMuted(false);
            }}
            aria-label="Volume"
            className="hidden h-1 w-20 cursor-pointer accent-white sm:block"
          />
          <span className="ml-1 shrink-0 text-xs tabular-nums text-white/80">
            {formatDuration(currentTime)} / {duration > 0 ? formatDuration(duration) : "--:--"}
          </span>

          <div className="ml-auto flex items-center gap-0.5">
            <ControlButton
              label="Captions"
              onClick={() => changeCaption(captionLang === "off" ? captions[0]?.lang ?? "off" : "off")}
              active={captionLang !== "off"}
              className="max-sm:hidden"
            >
              <Captions className="h-5 w-5" />
            </ControlButton>
            <ControlButton label="Settings" onClick={() => {
              setSettingsView("main");
              setSettingsOpen((value) => !value);
            }} active={settingsOpen}>
              <Settings className="h-5 w-5" />
            </ControlButton>
            {pipSupported ? (
              <ControlButton
                label="Picture in picture"
                onClick={togglePip}
                className="max-sm:hidden"
              >
                <PictureInPicture className="h-5 w-5" />
              </ControlButton>
            ) : null}
            <ControlButton label={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  active = false,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/15",
        active && "bg-white/20 text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SettingsRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/10"
    >
      <span>{label}</span>
      <span className="text-xs text-white/70">{value}</span>
    </button>
  );
}

function SettingsBack({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-white/70 transition-colors hover:bg-white/10"
    >
      <span aria-hidden="true">‹</span>
      {label}
    </button>
  );
}
