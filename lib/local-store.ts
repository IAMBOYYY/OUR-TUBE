"use client";

import { useMemo, useSyncExternalStore } from "react";

const EVENT_NAME = "ourtube:local-change";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", callback);
  window.addEventListener(EVENT_NAME, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT_NAME, callback);
  };
}

function readRaw(key: string): string {
  if (typeof window === "undefined") {
    return "[]";
  }

  try {
    return window.localStorage.getItem(key) ?? "[]";
  } catch {
    return "[]";
  }
}

function emitChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(EVENT_NAME));
}

export function readList(key: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(readRaw(key));

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function writeList(key: string, items: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    emitChange();
  } catch {
    return;
  }
}

export function addToList(key: string, item: string, max?: number) {
  const next = [item, ...readList(key).filter((value) => value !== item)];

  writeList(key, typeof max === "number" ? next.slice(0, max) : next);
}

export function removeFromList(key: string, item: string) {
  writeList(
    key,
    readList(key).filter((value) => value !== item),
  );
}

export function toggleInList(key: string, item: string): boolean {
  const current = readList(key);

  if (current.includes(item)) {
    writeList(
      key,
      current.filter((value) => value !== item),
    );
    return false;
  }

  writeList(key, [item, ...current]);
  return true;
}

export function useLocalList(key: string): string[] {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => "[]",
  );

  return useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((item): item is string => typeof item === "string");
    } catch {
      return [];
    }
  }, [raw]);
}

export function useIsInList(key: string, item: string): boolean {
  const list = useLocalList(key);
  return list.includes(item);
}

export function writeLocalValue(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
    emitChange();
  } catch {
    return;
  }
}
