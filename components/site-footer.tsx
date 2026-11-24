import Link from "next/link";

import { GithubIcon, PlayIcon } from "@/components/icons";
import {
  CHANNEL_TEMPLATE_URL,
  GITHUB_TOPIC_URL,
  GITHUB_URL,
  SITE_NAME,
} from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-amber-400 text-white">
              <PlayIcon className="ml-0.5 h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black tracking-[0.18em]">
              OUR <span className="text-primary">TUBE</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted">
            Open video, owned by its creators. Discover channels published on
            GitHub, no algorithm required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
          <Link
            href={CHANNEL_TEMPLATE_URL}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-foreground"
          >
            Channel template
          </Link>
          <Link
            href={GITHUB_TOPIC_URL}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-foreground"
          >
            GitHub topic
          </Link>
          <Link
            href={`${GITHUB_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-foreground"
          >
            MIT License
          </Link>
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:text-foreground"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
