import Link from "next/link";

import { GithubIcon, PlayIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  CHANNEL_TEMPLATE_URL,
  GITHUB_URL,
  SITE_NAME,
} from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={`${SITE_NAME} home`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-400 text-white shadow-lg shadow-rose-500/20 transition group-hover:rotate-3 group-hover:scale-105">
            <PlayIcon className="ml-0.5 h-4 w-4" />
          </span>
          <span className="text-sm font-black tracking-[0.18em]">
            OUR <span className="text-primary">TUBE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-card hover:text-foreground"
          >
            Discover
          </Link>
          <Link
            href={CHANNEL_TEMPLATE_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-card hover:text-foreground"
          >
            Start a channel
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="OUR TUBE on GitHub"
            className="hidden h-10 w-10 place-items-center rounded-xl border border-border bg-card text-muted transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground sm:grid"
          >
            <GithubIcon className="h-[18px] w-[18px]" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
