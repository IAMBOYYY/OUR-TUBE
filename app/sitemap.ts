import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";
import { getSiteData } from "@/lib/github";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { channels, videos, shorts } = await getSiteData();
  const now = new Date();
  const baseUrl = SITE_URL.replace(/\/+$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now },
    { url: `${baseUrl}/subs`, lastModified: now },
    { url: `${baseUrl}/music`, lastModified: now },
    { url: `${baseUrl}/channels`, lastModified: now },
    { url: `${baseUrl}/shorts`, lastModified: now },
    { url: `${baseUrl}/create`, lastModified: now },
  ];

  const channelRoutes: MetadataRoute.Sitemap = channels.map((channel) => ({
    url: `${baseUrl}/channel/${encodeURIComponent(channel.owner)}/${encodeURIComponent(channel.repo)}`,
    lastModified: channel.pushedAt ? new Date(channel.pushedAt) : now,
  }));

  const videoRoutes: MetadataRoute.Sitemap = videos
    .filter((video) => !video.isShort)
    .map((video) => ({
      url: `${baseUrl}/watch/${encodeURIComponent(video.owner)}/${encodeURIComponent(video.repo)}/${encodeURIComponent(video.id)}`,
      lastModified: video.date ? new Date(video.date) : now,
    }));

  const shortRoutes: MetadataRoute.Sitemap = shorts.map((short) => ({
    url: `${baseUrl}/shorts/${encodeURIComponent(short.owner)}/${encodeURIComponent(short.repo)}/${encodeURIComponent(short.id)}`,
    lastModified: short.date ? new Date(short.date) : now,
  }));

  return [...staticRoutes, ...channelRoutes, ...videoRoutes, ...shortRoutes];
}
