import { fileExtension } from "@/lib/utils";

type CacheEntry = {
  expires: number;
  value: number | null;
};

const CACHE_MS = 24 * 60 * 60 * 1000;
const MAX_REQUESTS = 6;
const MAX_CONCURRENCY = 6;
const REQUEST_TIMEOUT_MS = 12_000;
const SUPPORTED = new Set(["mp4", "mov", "m4v", "m4a"]);

const cache = new Map<string, CacheEntry>();
let active = 0;
const queue: Array<() => void> = [];

async function acquire(): Promise<void> {
  if (active < MAX_CONCURRENCY) {
    active += 1;
    return;
  }

  await new Promise<void>((resolve) => {
    queue.push(() => {
      active += 1;
      resolve();
    });
  });
}

function release() {
  active -= 1;
  const next = queue.shift();

  if (next) {
    next();
  }
}

function readUint64(view: DataView, offset: number): number {
  if (offset + 8 > view.byteLength) {
    return 0;
  }

  const value = view.getBigUint64(offset);
  return value > BigInt(Number.MAX_SAFE_INTEGER)
    ? Number.MAX_SAFE_INTEGER
    : Number(value);
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  let value = "";

  for (let index = start; index < end && index < bytes.length; index += 1) {
    value += String.fromCharCode(bytes[index]);
  }

  return value;
}

type RangeResult = {
  data: Uint8Array;
  total: number | null;
};

type Box = {
  type: string;
  size: number;
  headerSize: number;
  contentStart: number;
};

class RequestBudget {
  count = 0;

  spend() {
    this.count += 1;

    if (this.count > MAX_REQUESTS) {
      throw new Error("Too many range requests");
    }
  }
}

async function rangeFetch(
  url: string,
  start: number,
  end: number,
  signal: AbortSignal,
  budget: RequestBudget,
): Promise<RangeResult> {
  budget.spend();

  const response = await fetch(url, {
    headers: {
      Range: `bytes=${start}-${end}`,
      "User-Agent": "our-tube",
    },
    redirect: "follow",
    cache: "no-store",
    signal,
  });

  if (!response.ok && response.status !== 206) {
    throw new Error(`Range request failed (${response.status})`);
  }

  const contentRange = response.headers.get("content-range");
  let total: number | null = null;

  if (contentRange) {
    const match = contentRange.match(/bytes\s+\d+-\d+\/(\d+)/i);

    if (match) {
      total = Number(match[1]);
    }
  }

  const contentLength = Number(response.headers.get("content-length") ?? "0");

  if (total === null && response.status === 200 && contentLength > 0) {
    total = contentLength;
  }

  if (
    response.status === 200 &&
    total !== null &&
    total > end - start + 1 + 1_048_576
  ) {
    await response.body?.cancel();
    throw new Error("Range requests are not supported");
  }

  const buffer = await response.arrayBuffer();
  return { data: new Uint8Array(buffer), total };
}

async function readBox(
  url: string,
  offset: number,
  total: number,
  signal: AbortSignal,
  budget: RequestBudget,
): Promise<Box | null> {
  const header = await rangeFetch(
    url,
    offset,
    Math.min(offset + 15, total - 1),
    signal,
    budget,
  );

  if (header.data.byteLength < 8) {
    return null;
  }

  const view = new DataView(
    header.data.buffer,
    header.data.byteOffset,
    header.data.byteLength,
  );
  let size = view.getUint32(0);
  let headerSize = 8;

  if (size === 1) {
    if (header.data.byteLength < 16) {
      const extended = await rangeFetch(
        url,
        offset,
        Math.min(offset + 23, total - 1),
        signal,
        budget,
      );
      const extendedView = new DataView(
        extended.data.buffer,
        extended.data.byteOffset,
        extended.data.byteLength,
      );
      size = readUint64(extendedView, 8);
    } else {
      size = readUint64(view, 8);
    }

    headerSize = 16;
  } else if (size === 0) {
    size = total - offset;
  }

  return {
    type: ascii(header.data, 4, 8),
    size,
    headerSize,
    contentStart: offset + headerSize,
  };
}

function parseMvhd(payload: Uint8Array): number | null {
  if (payload.byteLength < 20) {
    return null;
  }

  const view = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength,
  );
  const version = payload[0];

  if (version === 1) {
    if (payload.byteLength < 32) {
      return null;
    }

    const timescale = view.getUint32(20);
    const duration = readUint64(view, 24);

    if (timescale <= 0 || duration <= 0) {
      return null;
    }

    return duration / timescale;
  }

  if (payload.byteLength < 20) {
    return null;
  }

  const timescale = view.getUint32(12);
  const duration = view.getUint32(16);

  if (timescale <= 0 || duration <= 0) {
    return null;
  }

  return duration / timescale;
}

function findMvhd(data: Uint8Array, contentSize: number): number | null {
  let offset = 0;
  let guard = 0;

  while (offset + 8 <= data.byteLength && guard < 64) {
    guard += 1;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let size = view.getUint32(offset);
    let headerSize = 8;
    const type = ascii(data, offset + 4, offset + 8);

    if (size === 1) {
      size = readUint64(view, offset + 8);
      headerSize = 16;
    } else if (size === 0) {
      size = contentSize - offset;
    }

    if (size < headerSize) {
      return null;
    }

    if (type === "mvhd") {
      return parseMvhd(data.subarray(offset + headerSize));
    }

    offset += size;
  }

  return null;
}

async function computeDuration(url: string): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const budget = new RequestBudget();

  try {
    const first = await rangeFetch(url, 0, 15, controller.signal, budget);
    let total = first.total;

    if (total === null || total <= 0) {
      return null;
    }

    let offset = 0;
    let guard = 0;

    while (offset < total && guard < 100) {
      guard += 1;
      const box = await readBox(url, offset, total, controller.signal, budget);

      if (!box || box.size <= 0) {
        return null;
      }

      if (box.type === "moov") {
        const contentSize = box.size - box.headerSize;

        if (contentSize <= 0) {
          return null;
        }

        const readSize = Math.min(contentSize, 4096);
        const content = await rangeFetch(
          url,
          box.contentStart,
          box.contentStart + readSize - 1,
          controller.signal,
          budget,
        );

        return findMvhd(content.data, contentSize);
      }

      offset += box.size;
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getMp4Duration(url: string): Promise<number | null> {
  if (!SUPPORTED.has(fileExtension(url))) {
    return null;
  }

  const cached = cache.get(url);

  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }

  await acquire();

  try {
    const second = cache.get(url);

    if (second && second.expires > Date.now()) {
      return second.value;
    }

    const value = await computeDuration(url);
    cache.set(url, { expires: Date.now() + CACHE_MS, value });
    return value;
  } finally {
    release();
  }
}
