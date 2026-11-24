"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type VideoFilter = "all" | "video" | "music";

type SearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
  filter: VideoFilter;
  setFilter: (value: VideoFilter) => void;
  reset: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VideoFilter>("all");

  const value = useMemo(
    () => ({
      query,
      setQuery,
      filter,
      setFilter,
      reset: () => {
        setQuery("");
        setFilter("all");
      },
    }),
    [filter, query],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used inside SearchProvider");
  }

  return context;
}
