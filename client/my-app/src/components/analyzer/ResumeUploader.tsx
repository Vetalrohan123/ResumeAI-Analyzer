"use client";

import { useRef } from "react";
import { FileText, Upload, X } from "lucide-react";

interface ResumeUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function ResumeUploader({
  file,
  onFileChange,
}: ResumeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please upload a PDF or DOCX file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    onFileChange(selectedFile);
  };

  return (
    <div>
      <h2 className="mb-3 text-lg font-medium text-white">
        Your Resume
      </h2>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className="group cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-10 text-center transition hover:border-violet-500/60 hover:bg-zinc-900"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
            <Upload className="h-6 w-6 text-zinc-400 transition group-hover:text-violet-400" />
          </div>

          <h3 className="text-base font-medium text-white">
            Drop your resume here
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            PDF or DOCX up to 10MB
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            Browse Files
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/10">
              <FileText className="h-5 w-5 text-violet-400" />
            </div>

            <div>
              <p className="max-w-[260px] truncate text-sm font-medium text-white">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Remove resume"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}