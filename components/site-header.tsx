"use client";

import {
  Clapperboard,
  Clock,
  History,
  Home,
  ListVideo,
  Menu,
  Music,
  Play,
  Plus,
  Search,
  ThumbsUp,
  Tv,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { SearchBox } from "@/components/search-box";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SuggestionIndex } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/subs", label: "Subs" },
  { href: "/music", label: "Music" },
  { href: "/channels", label: "Channels" },
];

const DRAWER_LINKS: Array<{ href: string; label: string; icon: ReactNode }> = [
  { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { href: "/subs", label: "Subs", icon: <ListVideo className="h-5 w-5" /> },
  { href: "/music", label: "Music", icon: <Music className="h-5 w-5" /> },
  { href: "/channels", label: "Channels", icon: <Tv className="h-5 w-5" /> },
  { href: "/you", label: "You", icon: <User className="h-5 w-5" /> },
  { href: "/history", label: "History", icon: <History className="h-5 w-5" /> },
  { href: "/watch-later", label: "Watch later", icon: <Clock className="h-5 w-5" /> },
  { href: "/liked", label: "Liked videos", icon: <ThumbsUp className="h-5 w-5" /> },
  { href: "/create", label: "Create a channel", icon: <Plus className="h-5 w-5" /> },
];

export function SiteHeader({ index }: { index: SuggestionIndex }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!searchOpen && !drawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen, searchOpen]);

  function isTabActive(href: string): boolean {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-1 px-3 sm:px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="hidden h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground md:grid"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="ml-1 flex shrink-0 items-center gap-1.5 rounded-md px-1 py-1"
            aria-label="OurTube home"
          >
            <Play
              className="h-6 w-6 fill-accent text-accent"
              strokeWidth={0}
              aria-hidden="true"
            />
            <span className="text-lg font-semibold tracking-tight">OurTube</span>
          </Link>

          <div className="hidden flex-1 justify-center px-6 md:flex">
            <div className="w-full max-w-xl">
              <SearchBox index={index} />
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground md:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>
        </div>

        <nav aria-label="Main sections" className="border-t border-border/60">
          <div className="mx-auto flex max-w-[1600px] gap-6 overflow-x-auto px-3 sm:px-4 lg:px-6">
            {TABS.map((tab) => {
              const active = isTabActive(tab.href);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative shrink-0 py-2.5 text-sm transition-colors",
                    active
                      ? "font-semibold text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {searchOpen ? (
        <div className="fixed inset-0 z-[85] flex flex-col bg-background md:hidden">
          <div className="flex h-14 items-center gap-2 px-2">
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <SearchBox
                index={index}
                autoFocus
                variant="plain"
                onClose={() => setSearchOpen(false)}
                placeholder="Search OurTube"
              />
            </div>
          </div>
        </div>
      ) : null}

      {drawerOpen ? (
        <div className="fixed inset-0 z-[85]">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="absolute inset-y-0 left-0 w-64 overflow-y-auto border-r border-border bg-background p-3"
          >
            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Play
                  className="h-5 w-5 fill-accent text-accent"
                  strokeWidth={0}
                  aria-hidden="true"
                />
                OurTube
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 space-y-0.5">
              {DRAWER_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface"
                >
                  <span className="text-muted">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="grid h-14 grid-cols-4">
          <BottomLink href="/" label="Home" active={pathname === "/"}>
            <Home
              className={cn("h-6 w-6", pathname === "/" && "fill-current")}
            />
          </BottomLink>
          <BottomLink
            href="/shorts"
            label="Shorts"
            active={pathname.startsWith("/shorts")}
          >
            <Clapperboard
              className={cn(
                "h-6 w-6 text-accent",
                pathname.startsWith("/shorts") && "fill-current",
              )}
            />
          </BottomLink>
          <BottomLink href="/create" label="Create" active={pathname === "/create"}>
            <Plus className="h-7 w-7" />
          </BottomLink>
          <BottomLink
            href="/you"
            label="You"
            active={["/you", "/history", "/watch-later", "/liked"].some((path) =>
              pathname.startsWith(path),
            )}
          >
            <User
              className={cn(
                "h-6 w-6",
                ["/you", "/history", "/watch-later", "/liked"].some((path) =>
                  pathname.startsWith(path),
                ) && "fill-current",
              )}
            />
          </BottomLink>
        </div>
      </nav>
    </>
  );
}

function BottomLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "grid min-h-11 place-items-center transition-colors",
        active ? "text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
