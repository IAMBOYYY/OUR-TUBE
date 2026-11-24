import type { Metadata } from "next";

import { HomeFeed } from "@/components/home-feed";
import { MusicIcon, PlayIcon, SparklesIcon } from "@/components/icons";
import { getAllVideos } from "@/lib/github";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Discover community video",
  description:
    "Browse independent videos and music from creators publishing openly on GitHub.",
};

type HomePageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const [videos, params] = await Promise.all([getAllVideos(), searchParams]);
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const channelCount = new Set(
    videos.map((video) => `${video.owner}/${video.repo}`),
  ).size;
  const musicCount = videos.filter((video) => video.type === "music").length;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-40 h-[34rem] w-[34rem] rounded-full bg-rose-500/10 blur-3xl dark:bg-rose-500/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted backdrop-blur">
              <SparklesIcon className="h-3.5 w-3.5 text-primary" />
              Community-powered, open by design
            </span>

            <h1 className="mt-5 text-balance text-4xl font-black tracking-tight sm:text-6xl">
              Your channel. Your audience.{" "}
              <span className="bg-gradient-to-r from-rose-500 via-primary to-amber-400 bg-clip-text text-transparent">
                OUR TUBE.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted sm:text-lg">
              Discover independent films, tutorials, and music from creators who
              publish on GitHub. No mysterious algorithm. No gatekeepers. Just
              channels you can follow and code you can fork.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5 text-sm">
              <Stat
                icon={<PlayIcon className="h-3.5 w-3.5" />}
                value={videos.length}
                label={videos.length === 1 ? "video" : "videos"}
              />
              <Stat
                icon={<SparklesIcon className="h-3.5 w-3.5" />}
                value={channelCount}
                label={channelCount === 1 ? "channel" : "channels"}
              />
              <Stat
                icon={<MusicIcon className="h-3.5 w-3.5" />}
                value={musicCount}
                label="music"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <HomeFeed videos={videos} initialQuery={initialQuery} />
      </section>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3.5 py-2 backdrop-blur">
      <span className="text-primary">{icon}</span>
      <span className="font-bold">{value}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}
