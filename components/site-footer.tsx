import { ExternalLink } from "lucide-react";
import Link from "next/link";

import {
  CHANNEL_TEMPLATE_URL,
  GITHUB_TOPIC_URL,
  GITHUB_URL,
} from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:px-6">
        <p>OurTube</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={CHANNEL_TEMPLATE_URL}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Channel template
          </Link>
          <Link
            href={GITHUB_TOPIC_URL}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub topic
          </Link>
          <Link
            href={`${GITHUB_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            MIT License
          </Link>
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
