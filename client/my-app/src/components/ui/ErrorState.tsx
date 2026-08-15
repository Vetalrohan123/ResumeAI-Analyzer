"use client";

import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
        <AlertCircle
          size={24}
          className="text-red-400"
        />
      </div>

      <h3 className="mt-4 text-base font-semibold text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      )}
    </div>
  );
}