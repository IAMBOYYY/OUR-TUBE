import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToastHost } from "@/components/toast-host";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getSuggestionIndex } from "@/lib/github";

import "./globals.css";

export const revalidate = 300;
export const maxDuration = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Open video, owned by its creators`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "open source video",
    "community video",
    "YouTube alternative",
    "GitHub",
    "Next.js",
    "openyoutube-channel",
  ],
  authors: [{ name: "OurTube contributors" }],
  creator: "OurTube contributors",
  openGraph: {
    title: `${SITE_NAME} — Open video, owned by its creators`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Open video, owned by its creators`,
    description: SITE_DESCRIPTION,
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem("ourtube-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const index = await getSuggestionIndex();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-md bg-foreground px-4 py-3 text-sm font-medium text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <div className="flex min-h-dvh flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
          <SiteHeader index={index} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <ToastHost />
      </body>
    </html>
  );
}
