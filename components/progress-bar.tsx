"use client";

import type { SSEProgress } from "@/lib/types";

interface ProgressBarProps {
  progress: SSEProgress;
  onCancel: () => void;
}

export function ProgressBar({ progress, onCancel }: ProgressBarProps) {
  const pct = progress.total && progress.current
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  const showBar = progress.phase === "fetch" && progress.total;

  return (
    <div className="animate-fade-in-up rounded-md border border-[#5848F7]/20 bg-white p-6 shadow-[0_1px_2px_rgba(10,13,18,0.05)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#1F1C26]">
          {progress.message || "Loading..."}
        </p>
        <button
          onClick={onCancel}
          className="text-xs text-[#77757B] hover:text-red-500 transition-colors font-semibold"
        >
          Cancel
        </button>
      </div>

      {showBar && (
        <>
          <div className="h-2 w-full rounded-full bg-[#F1F1FE] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#5848F7] transition-all duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#77757B] font-mono tabular-nums">
            {progress.current} / {progress.total} organizations ({pct}%)
          </p>
        </>
      )}

      {!showBar && (
        <div className="h-2 w-full rounded-full bg-[#F1F1FE] overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-[#5848F7]/60 animate-pulse-slow" />
        </div>
      )}
    </div>
  );
}
