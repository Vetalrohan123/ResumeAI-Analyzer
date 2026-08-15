"use client";

import { useState } from "react";
import { FileText, ClipboardPaste } from "lucide-react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobDescriptionInput({
  value,
  onChange,
}: JobDescriptionInputProps) {
  const [mode, setMode] = useState<"paste" | "upload">("paste");

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">
          Job Description
        </h2>

        <span className="text-xs text-zinc-500">
          {value.length} characters
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="flex border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`flex items-center gap-2 px-5 py-3 text-sm transition ${
              mode === "paste"
                ? "border-b border-violet-400 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <ClipboardPaste className="h-4 w-4" />
            Paste Text
          </button>

          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-2 px-5 py-3 text-sm transition ${
              mode === "upload"
                ? "border-b border-violet-400 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <FileText className="h-4 w-4" />
            Upload File
          </button>
        </div>

        {mode === "paste" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste the job description you're applying for..."
            className="min-h-[240px] w-full resize-none bg-transparent p-5 text-sm leading-7 text-zinc-200 outline-none placeholder:text-zinc-600"
          />
        ) : (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-zinc-600" />

            <p className="mt-3 text-sm text-zinc-400">
              Job description file upload will be connected later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}