import { MessageCircle } from "lucide-react";

import { cn, discussionsUrl } from "@/lib/utils";

type DiscussButtonProps = {
  owner: string;
  repo: string;
  className?: string;
  tone?: "default" | "inverse";
};

export function DiscussButton({
  owner,
  repo,
  className,
  tone = "default",
}: DiscussButtonProps) {
  return (
    <a
      href={discussionsUrl(owner, repo)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
        tone === "inverse"
          ? "border-white/40 text-white hover:bg-white/15"
          : "border-border hover:bg-surface",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      Discuss on GitHub
    </a>
  );
}
