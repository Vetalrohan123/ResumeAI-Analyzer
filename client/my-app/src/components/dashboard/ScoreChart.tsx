"use client";

import { useEffect, useState } from "react";

interface ScoreChartProps {
  score: number;
}

export default function ScoreChart({ score }: ScoreChartProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);

    return () => clearTimeout(timer);
  }, [score]);

  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex justify-center py-4">
      <div className="relative h-56 w-56">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-white/[0.06]"
          />

          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-violet-500 transition-all duration-1000 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-semibold tracking-tight">
            {animatedScore}
          </span>

          <span className="mt-1 text-sm text-zinc-500">
            / 100
          </span>

          <span className="mt-2 text-xs font-medium text-emerald-400">
            Excellent
          </span>
        </div>
      </div>
    </div>
  );
}