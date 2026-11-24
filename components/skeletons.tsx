import { cn } from "@/lib/utils";

export function VideoCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex gap-3 p-2">
        <div className="skeleton aspect-video w-36 shrink-0 rounded-xl sm:w-40" />
        <div className="min-w-0 flex-1 py-1">
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton mt-2 h-3.5 w-3/4 rounded" />
          <div className="skeleton mt-3 h-2.5 w-1/2 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="skeleton aspect-video rounded-2xl" />
      <div className="mt-3 flex gap-3">
        <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton mt-2 h-4 w-2/3 rounded" />
          <div className="skeleton mt-3 h-3 w-1/3 rounded" />
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
      className={cn(
        compact
          ? "space-y-2"
          : "grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <VideoCardSkeleton key={index} compact={compact} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="skeleton h-10 w-52 rounded-xl" />
      <div className="skeleton mt-4 h-4 w-80 max-w-full rounded" />
      <div className="skeleton mt-8 h-12 w-full max-w-xl rounded-2xl" />
      <VideoGridSkeleton className="mt-10" />
    </div>
  );
}

export function ChannelSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="skeleton h-44 w-full rounded-3xl sm:h-60 lg:h-72" />
      <div className="relative -mt-12 flex items-end gap-4 px-4 sm:-mt-16 sm:gap-6 sm:px-8">
        <div className="skeleton h-24 w-24 shrink-0 rounded-3xl border-4 border-background sm:h-32 sm:w-32" />
        <div className="mb-2 min-w-0 flex-1">
          <div className="skeleton h-8 w-64 max-w-full rounded-lg" />
          <div className="skeleton mt-3 h-4 w-96 max-w-full rounded" />
        </div>
      </div>
      <VideoGridSkeleton className="mt-12" count={6} />
    </div>
  );
}

export function WatchSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="skeleton h-8 w-28 rounded-lg" />
      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <div className="skeleton aspect-video w-full rounded-2xl" />
          <div className="skeleton mt-6 h-8 w-3/4 rounded-lg" />
          <div className="skeleton mt-3 h-4 w-48 rounded" />
          <div className="mt-6 flex items-center gap-3">
            <div className="skeleton h-12 w-12 rounded-full" />
            <div className="skeleton h-4 w-40 rounded" />
          </div>
          <div className="skeleton mt-6 h-32 w-full rounded-2xl" />
        </div>
        <div className="space-y-3">
          <div className="skeleton mb-4 h-6 w-32 rounded" />
          <VideoGridSkeleton count={6} compact />
        </div>
      </div>
    </div>
  );
}
