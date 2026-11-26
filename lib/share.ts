import { showToast } from "@/components/toast-host";

type ShareOptions = {
  title: string;
  url: string;
};

export async function shareLink({ title, url }: ShareOptions) {
  const absolute = typeof window === "undefined" ? url : new URL(url, window.location.origin).toString();

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, url: absolute });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  try {
    await navigator.clipboard.writeText(absolute);
    showToast("Link copied");
  } catch {
    showToast("Could not copy the link");
  }
}
