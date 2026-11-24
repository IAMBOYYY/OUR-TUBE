import { cn } from "@/lib/utils";

export function VideoCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex animate-pulse gap-2" aria-hidden="true">
        <div className="aspect-video w-40 shrink-0 rounded-md bg-surface" />
        <div className="min-w-0 flex-1 py-0.5">
          <div className="h-3.5 w-full rounded bg-surface" />
          <div className="mt-2 h-3.5 w-3/4 rounded bg-surface" />
          <div className="mt-3 h-3 w-1/2 rounded bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-video rounded-none bg-surface sm:rounded-lg" />
      <div className="mt-3 flex gap-3 px-3 sm:mt-2 sm:px-0">
        <div className="h-9 w-9 shrink-0 rounded-full bg-surface" />
        <div className="min-w-0 flex-1">
          <div className="h-3.5 w-full rounded bg-surface" />
          <div className="mt-2 h-3.5 w-2/3 rounded bg-surface" />
          <div className="mt-2 h-3 w-1/3 rounded bg-surface" />
        </div>
      </div>
    </div>
  );
}

export function VideoGridSkeleton({
  count = 8,
  compact = false,
  className,
}: {
  count?: number;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading videos"
      className={cn(
        compact
          ? "space-y-3"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <VideoCardSkeleton key={index} compact={compact} />
      ))}
      <span className="sr-only">Loading videos</span>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <VideoGridSkeleton />
    </div>
  );
}

export function ChannelSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="h-32 animate-pulse rounded-lg bg-surface sm:h-48 lg:h-56" />
      <div className="mt-4 flex animate-pulse gap-4">
        <div className="h-20 w-20 shrink-0 rounded-full bg-surface sm:h-28 sm:w-28" />
        <div className="min-w-0 flex-1 py-1">
          <div className="h-6 w-56 max-w-full rounded bg-surface" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-surface" />
          <div className="mt-2 h-3 w-64 max-w-full rounded bg-surface" />
        </div>
      </div>
      <VideoGridSkeleton className="mt-8" count={6} />
    </div>
  );
}

export function WatchSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] px-0 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <div className="aspect-video animate-pulse rounded-none bg-surface sm:rounded-lg" />
          <div className="mt-4 animate-pulse px-3 sm:px-0">
            <div className="h-6 w-3/4 rounded bg-surface" />
            <div className="mt-4 h-4 w-48 rounded bg-surface" />
            <div className="mt-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-surface" />
              <div className="h-4 w-40 rounded bg-surface" />
            </div>
            <div className="mt-5 h-24 w-full rounded bg-surface" />
          </div>
        </div>
        <div className="px-3 sm:px-0">
          <div className="mb-4 h-5 w-28 animate-pulse rounded bg-surface" />
          <VideoGridSkeleton count={6} compact />
        </div>
      </div>
    </div>
  );
}

export function ChannelsSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] px-3 py-6 sm:px-4 lg:px-6">
      <div className="h-6 w-32 animate-pulse rounded bg-surface" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-3 rounded-lg border border-border p-3"
            aria-hidden="true"
          >
            <div className="h-14 w-14 shrink-0 rounded-full bg-surface" />
            <div className="min-w-0 flex-1 py-1">
              <div className="h-4 w-2/3 rounded bg-surface" />
              <div className="mt-2 h-3 w-full rounded bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
