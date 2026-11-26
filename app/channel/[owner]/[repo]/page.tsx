import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChannelContent } from "@/components/channel-content";
import { ChannelHeader } from "@/components/channel-header";
import { FeedError } from "@/components/feed-states";
import { getChannel, getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

type ChannelPageProps = {
  params: Promise<{ owner: string; repo: string }>;
};

export async function generateMetadata({
  params,
}: ChannelPageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  const channel = await getChannel(owner, repo);

  if (!channel) {
    return { title: "Channel not found" };
  }

  return {
    title: channel.name,
    description:
      channel.description ||
      `${channel.name} publishes videos and music on OurTube.`,
    openGraph: {
      title: channel.name,
      description: channel.description,
      type: "website",
      images: [{ url: channel.logo }],
    },
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { owner, repo } = await params;
  const [channel, site] = await Promise.all([
    getChannel(owner, repo),
    getSiteData(),
  ]);

  if (!channel) {
    if (site.failed && site.channels.length === 0) {
      return <FeedError />;
    }

    notFound();
  }

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <ChannelHeader channel={channel} />
      <ChannelContent channel={channel} />
    </div>
  );
}
