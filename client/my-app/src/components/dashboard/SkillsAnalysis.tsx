"use client";

import { Code2 } from "lucide-react";

interface Skill {
  name: string;
  category: string;
  score: number;
}

interface SkillsAnalysisProps {
  skills: Skill[];
}

export default function SkillsAnalysis({
  skills,
}: SkillsAnalysisProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111111] p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Skills Analysis
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            How closely your skills match this position.
          </p>
        </div>

        <Code2 size={18} className="text-zinc-600" />
      </div>

      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  {skill.name}
                </span>

                <span className="ml-2 text-xs text-zinc-600">
                  {skill.category}
                </span>
              </div>

              <span className="text-sm text-zinc-400">
                {skill.score}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-700"
                style={{
                  width: `${skill.score}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}