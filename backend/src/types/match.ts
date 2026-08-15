export interface MatchResume {
  id: string;

  name?: string | null;

  originalName?: string | null;

  fileName?: string | null;

  email?: string | null;

  phone?: string | null;

  atsScore?: number | null;

  score?: number | null;
}

export interface JobMatch {
  id: string;

  jobId: string;

  resumeId: string;

  matchScore: number;

  matchedSkills: string[];

  missingSkills: string[];

  strengths: string[];

  weaknesses: string[];

  recommendations: string[];

  hiringRecommendation?: string | null;

  createdAt?: string;

  resume?: MatchResume;
}

export interface JobMatchResponse {
  success: boolean;

  message?: string;

  data: JobMatch[];
}