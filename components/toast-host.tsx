"use client";

import { useEffect, useState } from "react";

type ToastMessage = {
  id: number;
  text: string;
};

export function showToast(text: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("ourtube:toast", { detail: { text } }),
  );
}

export function ToastHost() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<{ text: string }>).detail;

      if (!detail?.text) {
        return;
      }

      const id = Date.now() + Math.random();
      setMessages((current) => [...current, { id, text: detail.text }]);

      window.setTimeout(() => {
        setMessages((current) => current.filter((item) => item.id !== id));
      }, 2600);
    }

    window.addEventListener("ourtube:toast", handleToast);
    return () => window.removeEventListener("ourtube:toast", handleToast);
  }, []);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className="rounded-full border border-border bg-foreground px-4 py-2 text-xs font-medium text-background"
        >
          {message.text}
        </div>
      ))}
    </div>
  );
}
