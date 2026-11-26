import type { Metadata } from "next";

import { FeedError } from "@/components/feed-states";
import { SearchResults } from "@/components/search-results";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;
export const maxDuration = 60;

type ResultsPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: ResultsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  return {
    title: query ? `Results for ${query}` : "Search",
    description: query
      ? `Videos, Shorts, channels and posts matching ${query} on OurTube.`
      : "Search OurTube.",
  };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim();
  const data = await getSiteData();

  if (data.failed && data.channels.length === 0) {
    return <FeedError />;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <h1 className="px-3 text-xl font-semibold tracking-tight sm:px-0">
        {query ? "Search results" : "Search"}
      </h1>
      <SearchResults data={data} query={query} />
    </div>
  );
}
