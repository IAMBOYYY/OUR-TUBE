export default function Loading() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse px-3 py-6 sm:px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-surface" />
        <div>
          <div className="h-6 w-28 rounded bg-surface" />
          <div className="mt-2 h-3 w-20 rounded bg-surface" />
        </div>
      </div>
      <div className="mt-6 h-10 w-full rounded-lg bg-surface" />
      <div className="mt-8 h-5 w-24 rounded bg-surface" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-14 rounded-lg bg-surface" />
        ))}
      </div>
    </div>
  );
}
