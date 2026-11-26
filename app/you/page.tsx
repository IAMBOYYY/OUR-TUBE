import type { Metadata } from "next";

import { YouView } from "@/components/you-view";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "You",
  description: "Your library on this device: history, watch later and liked videos.",
};

export default async function YouPage() {
  const { videos } = await getSiteData();

  return <YouView videos={videos} />;
}
