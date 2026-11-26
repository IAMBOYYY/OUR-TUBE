import { VideoOff } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { RefreshButton } from "@/components/refresh-button";

export function FeedEmpty() {
  return (
    <EmptyState
      icon={<VideoOff className="h-10 w-10" />}
      title="No videos right now"
      description="Check back soon. New videos show up here."
    >
      <RefreshButton />
    </EmptyState>
  );
}

export function FeedError() {
  return (
    <EmptyState
      icon={<VideoOff className="h-10 w-10" />}
      title="Couldn't load videos"
      description="GitHub did not answer. Try again in a moment."
    >
      <RefreshButton />
    </EmptyState>
  );
}
