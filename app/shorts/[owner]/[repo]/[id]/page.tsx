import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeedError } from "@/components/feed-states";
import { ShortsPlayer } from "@/components/shorts-player";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

type ShortPageProps = {
  params: Promise<{ owner: string; repo: string; id: string }>;
};

export async function generateMetadata({
  params,
}: ShortPageProps): Promise<Metadata> {
  const { owner, repo, id } = await params;
  const { shorts } = await getSiteData();
  const short = shorts.find(
    (item) =>
      item.owner === owner && item.repo === repo && item.id === id,
  );

  if (!short) {
    return { title: "Short not found" };
  }

  return {
    title: short.title,
    description: short.description || `Watch ${short.title} on OurTube Shorts.`,
    openGraph: {
      title: short.title,
      description: short.description,
      type: "video.other",
      images: short.thumbnail ? [{ url: short.thumbnail }] : undefined,
    },
  };
}

export default async function ShortPage({ params }: ShortPageProps) {
  const { owner, repo, id } = await params;
  const { shorts, channels, failed } = await getSiteData();
  const key = `${owner}/${repo}/${id}`;
  const short = shorts.find(
    (item) => `${item.owner}/${item.repo}/${item.id}` === key,
  );

  if (!short) {
    if (failed && channels.length === 0) {
      return <FeedError />;
    }

    notFound();
  }

  return <ShortsPlayer shorts={shorts} initialKey={key} />;
}
