"use client";

import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({
  message = "Loading...",
}: PageLoaderProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Loader2
            size={24}
            className="animate-spin text-violet-400"
          />
        </div>

        <p className="mt-4 text-sm text-zinc-400">
          {message}
        </p>
      </div>
    </div>
  );
}