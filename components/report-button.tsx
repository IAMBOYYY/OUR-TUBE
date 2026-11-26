import { Flag } from "lucide-react";

import { cn, reportIssueUrl } from "@/lib/utils";

type ReportButtonProps = {
  owner: string;
  repo: string;
  id: string;
  className?: string;
};

export function ReportButton({ owner, repo, id, className }: ReportButtonProps) {
  return (
    <a
      href={reportIssueUrl(owner, repo, id)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface",
        className,
      )}
    >
      <Flag className="h-4 w-4" aria-hidden="true" />
      Report
    </a>
  );
}
