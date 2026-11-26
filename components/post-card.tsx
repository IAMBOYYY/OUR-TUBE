import Link from "next/link";

import { DiscussButton } from "@/components/discuss-button";
import { MediaImage } from "@/components/media-image";
import type { Post } from "@/lib/types";
import { channelHref, formatRelativeDate } from "@/lib/utils";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <Link href={channelHref(post.owner, post.repo)}>
          <MediaImage
            src={post.channelLogo}
            alt=""
            className="h-10 w-10 rounded-full border border-border"
          />
        </Link>
        <div className="min-w-0">
          <Link
            href={channelHref(post.owner, post.repo)}
            className="block truncate text-sm font-medium hover:underline"
          >
            {post.channelName}
          </Link>
          <p
            className="truncate text-xs text-muted"
            suppressHydrationWarning
          >
            @{post.owner} · {formatRelativeDate(post.date)}
          </p>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-6">{post.text}</p>

      {post.image ? (
        <MediaImage
          src={post.image}
          alt=""
          className="mt-3 aspect-video w-full rounded-lg border border-border"
        />
      ) : null}

      {post.hasDiscussions ? (
        <div className="mt-4">
          <DiscussButton owner={post.owner} repo={post.repo} />
        </div>
      ) : null}
    </article>
  );
}
