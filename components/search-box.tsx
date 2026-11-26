"use client";

import { Clock, Hash, Search, Tv, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { RECENT_SEARCHES_KEY } from "@/lib/constants";
import { useLocalList, writeList } from "@/lib/local-store";
import { getSuggestions } from "@/lib/search";
import type { SuggestionIndex } from "@/lib/types";

type SearchBoxProps = {
  index: SuggestionIndex;
  autoFocus?: boolean;
  onClose?: () => void;
  variant?: "pill" | "plain";
  placeholder?: string;
};

export function SearchBox({
  index,
  autoFocus = false,
  onClose,
  variant = "pill",
  placeholder = "Search",
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recent = useLocalList(RECENT_SEARCHES_KEY);
  const suggestions = getSuggestions(index, query);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function remember(value: string) {
    const clean = value.trim();

    if (!clean) {
      return;
    }

    writeList(RECENT_SEARCHES_KEY, [
      clean,
      ...recent.filter((item) => item.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 8));
  }

  function go(value: string) {
    const clean = value.trim();

    if (!clean) {
      return;
    }

    remember(clean);
    setOpen(false);
    setQuery(clean);
    inputRef.current?.blur();
    onClose?.();
    router.push(`/results?q=${encodeURIComponent(clean)}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go(query);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (query) {
        setQuery("");
      } else {
        setOpen(false);
        inputRef.current?.blur();
        onClose?.();
      }
    }
  }

  const showSuggestions = open && query.trim().length > 0 && suggestions.length > 0;
  const showRecent = open && query.trim().length === 0 && recent.length > 0;

  return (
    <div ref={rootRef} className="relative w-full">
      <form
        role="search"
        onSubmit={handleSubmit}
        className={
          variant === "pill"
            ? "flex h-10 w-full items-center gap-2 rounded-full border border-border bg-surface px-4 transition-colors focus-within:border-foreground"
            : "flex h-12 w-full items-center gap-2 border-b border-border px-1"
        }
      >
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search OurTube"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {showSuggestions ? (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-background py-1"
        >
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.kind}:${suggestion.href}:${suggestion.label}`}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                remember(query);
                setOpen(false);
                onClose?.();
                router.push(suggestion.href);
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface"
            >
              {suggestion.kind === "channel" ? (
                <Tv className="h-4 w-4 shrink-0 text-muted" />
              ) : suggestion.kind === "tag" ? (
                <Hash className="h-4 w-4 shrink-0 text-muted" />
              ) : (
                <Video className="h-4 w-4 shrink-0 text-muted" />
              )}
              <span className="truncate">{suggestion.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {showRecent ? (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-background py-1">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Recent
            </span>
            <button
              type="button"
              onClick={() => writeList(RECENT_SEARCHES_KEY, [])}
              className="rounded px-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              Clear
            </button>
          </div>
          {recent.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => go(item)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface"
            >
              <Clock className="h-4 w-4 shrink-0 text-muted" />
              <span className="truncate">{item}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
