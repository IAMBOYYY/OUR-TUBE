"use client";

import { Home, Menu, Music, Play, Search, Tv, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { useSearch, type VideoFilter } from "@/components/search-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const filters: Array<{ value: VideoFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "video", label: "Videos" },
  { value: "music", label: "Music" },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { filter, reset, setFilter, setQuery } = useSearch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mobileSearchOpen) {
      return;
    }

    mobileInputRef.current?.focus();
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [drawerOpen]);

  function selectFilter(value: VideoFilter) {
    setFilter(value);

    if (pathname !== "/") {
      router.push("/");
    }
  }

  function goHome() {
    reset();
    setDrawerOpen(false);
    router.push("/");
  }

  function goMusic() {
    reset();
    setFilter("music");
    setDrawerOpen(false);
    router.push("/");
  }

  function goChannels() {
    setDrawerOpen(false);
    router.push("/channels");
  }

  function closeMobileSearch() {
    setMobileSearchOpen(false);
    setQuery("");
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mobileSearchOpen) {
      mobileInputRef.current?.blur();
    }

    if (pathname !== "/") {
      router.push("/");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-1 px-3 sm:px-4 lg:px-6">
          {mobileSearchOpen ? (
            <div
              className="flex w-full items-center gap-2"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  closeMobileSearch();
                }
              }}
            >
              <button
                type="button"
                onClick={closeMobileSearch}
                aria-label="Close search"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <SearchField
                inputRef={mobileInputRef}
                onSubmit={handleSearchSubmit}
              />
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                aria-expanded={drawerOpen}
                aria-controls="site-drawer"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link
                href="/"
                onClick={reset}
                className="ml-1 flex shrink-0 items-center gap-1.5 rounded-md px-1 py-1"
                aria-label="OurTube home"
              >
                <Play
                  className="h-6 w-6 fill-accent text-accent"
                  strokeWidth={0}
                  aria-hidden="true"
                />
                <span className="text-lg font-semibold tracking-tight">
                  OurTube
                </span>
              </Link>

              <div className="hidden flex-1 justify-center px-4 md:flex">
                <SearchField onSubmit={handleSearchSubmit} />
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  aria-label="Open search"
                  className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground md:hidden"
                >
                  <Search className="h-5 w-5" />
                </button>
                <ThemeToggle />
              </div>
            </>
          )}
        </div>

        <nav aria-label="Video filters" className="border-b border-border">
          <div className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto px-3 py-2 sm:px-4 lg:px-6">
            {filters.map((item) => {
              const active = filter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => selectFilter(item.value)}
                  aria-pressed={active}
                  className={
                    active
                      ? "shrink-0 rounded-full bg-foreground px-3.5 py-1.5 text-sm font-medium text-background"
                      : "shrink-0 rounded-full bg-surface px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            id="site-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="absolute inset-y-0 left-0 w-64 border-r border-border bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Menu</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-5 space-y-1">
              <DrawerButton icon={<Home className="h-5 w-5" />} onClick={goHome}>
                Home
              </DrawerButton>
              <DrawerButton
                icon={<Music className="h-5 w-5" />}
                onClick={goMusic}
              >
                Music
              </DrawerButton>
              <DrawerButton
                icon={<Tv className="h-5 w-5" />}
                onClick={goChannels}
              >
                Channels
              </DrawerButton>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SearchField({
  inputRef,
  onSubmit,
}: {
  inputRef?: RefObject<HTMLInputElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { query, setQuery } = useSearch();

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="flex h-10 w-full max-w-xl items-center gap-2 rounded-full border border-border bg-surface px-4 transition-colors focus-within:border-foreground"
    >
      <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
        aria-label="Search videos"
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </form>
  );
}

function DrawerButton({
  icon,
  children,
  onClick,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-surface"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </button>
  );
}
