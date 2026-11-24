import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

import "./globals.css";

export const metadata: Metadata = {
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
  authors: [{ name: "OUR TUBE contributors" }],
  creator: "OUR TUBE contributors",
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

const themeScript = `(function(){try{var t=localStorage.getItem("our-tube-theme");document.documentElement.classList.toggle("dark",t!=="light")}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
