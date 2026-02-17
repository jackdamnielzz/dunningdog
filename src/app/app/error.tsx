"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <h1 className="text-2xl font-semibold text-zinc-900">We could not load the app dashboard</h1>
        <p className="text-sm text-zinc-700">
          This is typically a temporary environment issue. Use retry to reload this
          section, or open Settings to continue configuration.
        </p>
        <p className="text-xs text-zinc-500">Error code: {error.digest ?? "N/A"}</p>
        <div className="flex gap-3">
          <Button onClick={() => reset()}>Retry</Button>
          <Link
            href="/app/settings"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
          >
            Go to settings
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
          >
            Back to marketing
          </Link>
        </div>
      </main>
    </div>
  );
}
