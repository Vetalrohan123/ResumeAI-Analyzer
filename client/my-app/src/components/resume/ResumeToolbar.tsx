
"use client";

import {
  Download,
  Eye,
  Maximize2,
  Palette,
  Save,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface ResumeToolbarProps {
  template: string;
  zoom: number;
  isSaving?: boolean;
  onTemplateChange: (template: string) => void;
  onZoomChange: (zoom: number) => void;
  onPreview: () => void;
  onFullscreen: () => void;
  onSave: () => void;
  onDownload: () => void;
  onImprove: () => void;
}

const templates = [
  {
    id: "modern",
    label: "Modern",
  },
  {
    id: "classic",
    label: "Classic",
  },
  {
    id: "minimal",
    label: "Minimal",
  },
];

export default function ResumeToolbar({
  template,
  zoom,
  isSaving = false,
  onTemplateChange,
  onZoomChange,
  onPreview,
  onFullscreen,
  onSave,
  onDownload,
  onImprove,
}: ResumeToolbarProps) {
  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0b0b0b]/95 px-4 py-3 backdrop-blur-xl">
      {/* Template */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 text-sm text-zinc-400 md:flex">
          <Palette className="h-4 w-4" />
          <span>Template</span>
        </div>

        <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
          {templates.map((item) => {
            const active =
              template === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onTemplateChange(item.id)
                }
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Zoom Out */}
        <button
          type="button"
          onClick={() =>
            onZoomChange(
              Math.max(60, zoom - 10)
            )
          }
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        {/* Zoom */}
        <span className="min-w-[48px] text-center text-xs text-zinc-500">
          {zoom}%
        </span>

        {/* Zoom In */}
        <button
          type="button"
          onClick={() =>
            onZoomChange(
              Math.min(140, zoom + 10)
            )
          }
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-white/10" />

        {/* Preview */}
        <button
          type="button"
          onClick={onPreview}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Preview resume"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={onFullscreen}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Fullscreen preview"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="ml-1 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />

          <span>
            {isSaving ? "Saving..." : "Save"}
          </span>
        </button>

        {/* Improve */}
        <button
          type="button"
          onClick={onImprove}
          className="ml-1 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
        >
          <Sparkles className="h-4 w-4" />

          <span className="hidden sm:inline">
            Improve with AI
          </span>
        </button>

        {/* Download */}
        <button
          type="button"
          onClick={onDownload}
          className="ml-1 flex items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-400/20"
        >
          <Download className="h-4 w-4" />

          <span className="hidden sm:inline">
            Download
          </span>
        </button>
      </div>
    </div>
  );
}

