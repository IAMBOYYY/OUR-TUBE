import { Download } from "lucide-react";

import { DiscussButton } from "@/components/discuss-button";
import { LikeButton } from "@/components/like-button";
import { ReportButton } from "@/components/report-button";
import { SaveButton } from "@/components/save-button";
import { ShareButton } from "@/components/share-button";
import type { VideoWithChannel } from "@/lib/types";
import { videoKey, watchHref } from "@/lib/utils";

export function ActionRow({ video }: { video: VideoWithChannel }) {
  const key = videoKey(video.owner, video.repo, video.id);

  return (
    <div className="flex flex-wrap gap-2">
      <LikeButton targetKey={key} />
      <ShareButton
        title={video.title}
        url={watchHref(video.owner, video.repo, video.id)}
      />
      <SaveButton targetKey={key} />
      <a
        href={video.videoUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Download
      </a>
      <ReportButton owner={video.owner} repo={video.repo} id={video.id} />
      {video.hasDiscussions ? (
        <DiscussButton owner={video.owner} repo={video.repo} />
      ) : null}
    </div>
  );
}
