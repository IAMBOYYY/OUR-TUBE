import type { Metadata } from "next";
import { ExternalLink, GitBranch, Plus, Tag } from "lucide-react";
import Link from "next/link";

import {
  CHANNEL_TEMPLATE_URL,
  CHANNEL_TOPIC,
  GITHUB_URL,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create a channel",
  description: "Make your own OurTube channel with a public GitHub repository.",
};

const STEPS = [
  {
    title: "Use the template",
    body: "Open the template on GitHub. Tap Use this template, then Create a new repository. Choose Public. Do not fork it.",
  },
  {
    title: "Edit channel.json",
    body: "Change name and description. Replace assets/logo.png and assets/banner.png with your own images.",
  },
  {
    title: "Upload your logo and banner",
    body: "Use JPG, PNG or WEBP. The best file names are logo and banner. Keep them inside the assets folder.",
  },
  {
    title: "Create a release with your video",
    body: "Go to Releases, draft a release, attach the video in the Attach binaries box, and publish. Wait for the Action to finish with a green tick.",
  },
  {
    title: "Add the video and the topic",
    body: "Add title, description and the release link to videos.json. Then add the topic openyoutube-channel in About.",
  },
];

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-10 lg:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Create your channel
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        A channel is a normal public GitHub repository. No approval and no
        sign-in.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={CHANNEL_TEMPLATE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <GitBranch className="h-4 w-4" aria-hidden="true" />
          Open the template
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <Link
          href={`https://github.com/topics/${CHANNEL_TOPIC}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
        >
          <Tag className="h-4 w-4" aria-hidden="true" />
          {CHANNEL_TOPIC}
        </Link>
      </div>

      <ol className="mt-8 space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-3 rounded-xl border border-border p-4"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-sm font-semibold">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-xl border border-border p-4 text-sm leading-6 text-muted">
        <p>
          Optional: open Settings, then Features, and turn on Discussions if you
          want a Discuss on GitHub button.
        </p>
        <p className="mt-2">
          Read the full guide in the{" "}
          <Link
            href={`${CHANNEL_TEMPLATE_URL}/README.md`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            channel template
          </Link>
          . You can also browse the{" "}
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            OurTube source
          </Link>
          .
        </p>
      </div>

      <div className="mt-8">
        <Link
          href="/channels"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-surface"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          See existing channels
        </Link>
      </div>
    </div>
  );
}
