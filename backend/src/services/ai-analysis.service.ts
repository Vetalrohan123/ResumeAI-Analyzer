import "dotenv/config";

import { prisma } from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export interface AIJobAnalysisResult {
  matchScore: number;

  matchedSkills: string[];

  missingSkills: string[];

  strengths: string[];

  weaknesses: string[];

  recommendations: string[];

  hiringRecommendation: string;
}

/*
|--------------------------------------------------------------------------
| Gemini Response Types
|--------------------------------------------------------------------------
*/

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;

  error?: {
    message?: string;
    status?: string;
    code?: number;
  };
}

/*
|--------------------------------------------------------------------------
| AI Analysis Service
|--------------------------------------------------------------------------
*/

export class AIAnalysisService {
  /*
  |--------------------------------------------------------------------------
  | Gemini Configuration
  |--------------------------------------------------------------------------
  */

  private static readonly API_KEY =
    process.env.GEMINI_API_KEY;

  private static readonly MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";

  private static readonly API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${AIAnalysisService.MODEL}:generateContent`;

  /*
  |--------------------------------------------------------------------------
  | Analyze Resume Against Job
  |--------------------------------------------------------------------------
  */

  static async analyze(
    resumeId: string,
    jobId: string
  ): Promise<AIJobAnalysisResult> {
    /*
    |--------------------------------------------------------------------------
    | Validate IDs
    |--------------------------------------------------------------------------
    */

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    if (!jobId) {
      throw new Error(
        "Job ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate API Key
    |--------------------------------------------------------------------------
    */

    if (!this.API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not configured."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Debug Configuration
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "🤖 Gemini Configuration"
    );

    console.log(
      "Model:",
      this.MODEL
    );

    console.log(
      "API URL:",
      this.API_URL
    );

    console.log(
      "API Key:",
      `${this.API_KEY.substring(
        0,
        6
      )}********`
    );

    console.log(
      "========================================"
    );

    /*
    |--------------------------------------------------------------------------
    | Get Resume
    |--------------------------------------------------------------------------
    */

    const resume =
      await prisma.resume.findUnique({
        where: {
          id: resumeId,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Resume Text
    |--------------------------------------------------------------------------
    */

    if (
      !resume.extractedText ||
      !resume.extractedText.trim()
    ) {
      throw new Error(
        "Resume text is not available."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Job
    |--------------------------------------------------------------------------
    */

    const job =
      await prisma.job.findUnique({
        where: {
          id: jobId,
        },
      });

    if (!job) {
      throw new Error(
        "Job not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare Required Skills
    |--------------------------------------------------------------------------
    */

    let requiredSkills: string[] = [];

    if (
      Array.isArray(
        job.requiredSkills
      )
    ) {
      requiredSkills =
        job.requiredSkills.filter(
          (
            skill
          ): skill is string =>
            typeof skill ===
            "string"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare Resume Text
    |--------------------------------------------------------------------------
    */

    const resumeText =
      resume.extractedText
        .trim()
        .slice(0, 30000);

    /*
    |--------------------------------------------------------------------------
    | Prepare Job Description
    |--------------------------------------------------------------------------
    */

    const jobDescription = `
Job Title:
${job.title}

Company:
${job.company || "Not specified"}

Location:
${job.location || "Not specified"}

Employment Type:
${job.employmentType || "Not specified"}

Salary:
${job.salary || "Not specified"}

Job Description:
${job.description || "Not specified"}

Requirements:
${job.requirements || "Not specified"}

Required Skills:
${
  requiredSkills.length > 0
    ? requiredSkills.join(", ")
    : "Not specified"
}
`.trim();

    /*
    |--------------------------------------------------------------------------
    | AI Prompt
    |--------------------------------------------------------------------------
    */

    const prompt = `
You are an expert technical recruiter and ATS matching engine.

Compare the candidate resume against the job description.

Analyze:

1. Required technical skills
2. Matching technical skills
3. Missing technical skills
4. Relevant work experience
5. Years of experience
6. Education
7. Projects
8. Job responsibilities
9. Resume keywords
10. Overall suitability

IMPORTANT RULES:

- Do not invent candidate experience.
- Do not assume a skill exists if it is not explicitly present.
- Only mark a skill as matched when the resume clearly contains it.
- Missing skills must come from the job requirements.
- Match score must be an integer from 0 to 100.
- Be objective.
- Recommendations must be actionable.
- Return ONLY valid JSON.
- Do not return Markdown.
- Do not wrap JSON inside code fences.
- Do not add explanations outside the JSON.

Use exactly this structure:

{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "hiringRecommendation": ""
}

The hiringRecommendation MUST be one of:

"STRONG_HIRE"
"HIRE"
"CONSIDER"
"WEAK_MATCH"
"REJECT"

Use these guidelines:

90-100 = STRONG_HIRE
75-89 = HIRE
60-74 = CONSIDER
40-59 = WEAK_MATCH
0-39 = REJECT

========================
JOB DESCRIPTION
========================

${jobDescription}

========================
CANDIDATE RESUME
========================

${resumeText}

========================
RETURN JSON ONLY
========================
`.trim();

    /*
    |--------------------------------------------------------------------------
    | Gemini Request
    |--------------------------------------------------------------------------
    */

    const requestBody = {
      contents: [
        {
          role: "user",

          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],

      generationConfig: {
        responseMimeType:
          "application/json",

        maxOutputTokens: 4096,
      },
    };

    /*
    |--------------------------------------------------------------------------
    | Log Analysis
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "🤖 AI Resume ↔ Job Analysis"
    );

    console.log(
      "📄 Resume ID:",
      resumeId
    );

    console.log(
      "💼 Job ID:",
      jobId
    );

    console.log(
      "🤖 Model:",
      this.MODEL
    );

    console.log(
      "========================================"
    );

    /*
    |--------------------------------------------------------------------------
    | Call Gemini
    |--------------------------------------------------------------------------
    */

    let response: Response;

    try {
      response =
        await fetch(
          `${this.API_URL}?key=${this.API_KEY}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              requestBody
            ),
          }
        );
    } catch (error) {
      console.error(
        "❌ Gemini network error:",
        error
      );

      throw new Error(
        "Unable to connect to Gemini API."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Parse Response
    |--------------------------------------------------------------------------
    */

    let responseData: GeminiResponse;

    try {
      responseData =
        (await response.json()) as GeminiResponse;
    } catch (error) {
      console.error(
        "❌ Failed to parse Gemini response:",
        error
      );

      throw new Error(
        "Invalid response received from Gemini API."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Gemini API Error
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {
      console.error(
        "========================================"
      );

      console.error(
        "❌ GEMINI API ERROR"
      );

      console.error(
        "HTTP Status:",
        response.status
      );

      console.error(
        "Model:",
        this.MODEL
      );

      console.error(
        "Response:",
        JSON.stringify(
          responseData,
          null,
          2
        )
      );

      console.error(
        "========================================"
      );

      throw new Error(
        responseData.error?.message ||
          `Gemini API request failed with status ${response.status}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Generated Text
    |--------------------------------------------------------------------------
    */

    const generatedText =
      responseData
        .candidates?.[0]
        ?.content?.parts?.[0]
        ?.text;

    if (!generatedText) {
      console.error(
        "❌ Empty Gemini response:"
      );

      console.error(
        JSON.stringify(
          responseData,
          null,
          2
        )
      );

      throw new Error(
        "Gemini returned an empty analysis."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Log Generated Response
    |--------------------------------------------------------------------------
    */

    console.log(
      "🧠 Gemini response received."
    );

    console.log(
      generatedText
    );

    /*
    |--------------------------------------------------------------------------
    | Parse JSON
    |--------------------------------------------------------------------------
    */

    const parsed =
      this.parseJSON(
        generatedText
      );

    /*
    |--------------------------------------------------------------------------
    | Normalize Result
    |--------------------------------------------------------------------------
    */

    const result =
      this.normalizeResult(
        parsed
      );

    /*
    |--------------------------------------------------------------------------
    | Final Log
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "✅ AI Job Analysis Completed"
    );

    console.log(
      "📊 Match Score:",
      result.matchScore
    );

    console.log(
      "🎯 Hiring Recommendation:",
      result.hiringRecommendation
    );

    console.log(
      "========================================"
    );

    return result;
  }

  /*
  |--------------------------------------------------------------------------
  | Parse JSON
  |--------------------------------------------------------------------------
  */

  private static parseJSON(
    text: string
  ): unknown {
    let cleaned =
      text.trim();

    /*
    |--------------------------------------------------------------------------
    | Remove Markdown Code Fence
    |--------------------------------------------------------------------------
    */

    cleaned =
      cleaned.replace(
        /^```json\s*/i,
        ""
      );

    cleaned =
      cleaned.replace(
        /^```\s*/i,
        ""
      );

    cleaned =
      cleaned.replace(
        /\s*```$/i,
        ""
      );

    /*
    |--------------------------------------------------------------------------
    | Direct JSON Parse
    |--------------------------------------------------------------------------
    */

    try {
      return JSON.parse(
        cleaned
      );
    } catch {
      /*
      |--------------------------------------------------------------------------
      | Extract JSON Object
      |--------------------------------------------------------------------------
      */

      const start =
        cleaned.indexOf(
          "{"
        );

      const end =
        cleaned.lastIndexOf(
          "}"
        );

      if (
        start !== -1 &&
        end !== -1 &&
        end > start
      ) {
        const jsonText =
          cleaned.slice(
            start,
            end + 1
          );

        try {
          return JSON.parse(
            jsonText
          );
        } catch {
          // Continue below.
        }
      }
    }

    console.error(
      "❌ Invalid AI JSON:"
    );

    console.error(
      text
    );

    throw new Error(
      "AI returned invalid JSON."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize String Array
  |--------------------------------------------------------------------------
  */

  private static normalizeStringArray(
    value: unknown
  ): string[] {
    if (
      !Array.isArray(value)
    ) {
      return [];
    }

    return value
      .filter(
        (
          item
        ): item is string =>
          typeof item ===
          "string"
      )
      .map(
        (item) =>
          item.trim()
      )
      .filter(
        Boolean
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize Hiring Recommendation
  |--------------------------------------------------------------------------
  */

  private static normalizeHiringRecommendation(
    value: unknown,
    score: number
  ): string {
    const recommendation =
      typeof value ===
      "string"
        ? value
            .trim()
            .toUpperCase()
        : "";

    const allowed = [
      "STRONG_HIRE",
      "HIRE",
      "CONSIDER",
      "WEAK_MATCH",
      "REJECT",
    ];

    if (
      allowed.includes(
        recommendation
      )
    ) {
      return recommendation;
    }

    /*
    |--------------------------------------------------------------------------
    | Fallback Based On Score
    |--------------------------------------------------------------------------
    */

    if (score >= 90) {
      return "STRONG_HIRE";
    }

    if (score >= 75) {
      return "HIRE";
    }

    if (score >= 60) {
      return "CONSIDER";
    }

    if (score >= 40) {
      return "WEAK_MATCH";
    }

    return "REJECT";
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize Result
  |--------------------------------------------------------------------------
  */

  private static normalizeResult(
    result: unknown
  ): AIJobAnalysisResult {
    const data =
      result as Record<
        string,
        unknown
      >;

    /*
    |--------------------------------------------------------------------------
    | Normalize Score
    |--------------------------------------------------------------------------
    */

    let matchScore =
      Number(
        data?.matchScore
      ) || 0;

    matchScore =
      Math.round(
        matchScore
      );

    matchScore =
      Math.max(
        0,
        Math.min(
          100,
          matchScore
        )
      );

    /*
    |--------------------------------------------------------------------------
    | Normalize Arrays
    |--------------------------------------------------------------------------
    */

    const matchedSkills =
      this.normalizeStringArray(
        data?.matchedSkills
      );

    const missingSkills =
      this.normalizeStringArray(
        data?.missingSkills
      );

    const strengths =
      this.normalizeStringArray(
        data?.strengths
      );

    const weaknesses =
      this.normalizeStringArray(
        data?.weaknesses
      );

    const recommendations =
      this.normalizeStringArray(
        data?.recommendations
      );

    /*
    |--------------------------------------------------------------------------
    | Normalize Hiring Recommendation
    |--------------------------------------------------------------------------
    */

    const hiringRecommendation =
      this.normalizeHiringRecommendation(
        data?.hiringRecommendation,
        matchScore
      );

    /*
    |--------------------------------------------------------------------------
    | Return
    |--------------------------------------------------------------------------
    */

    return {
      matchScore,

      matchedSkills,

      missingSkills,

      strengths,

      weaknesses,

      recommendations,

      hiringRecommendation,
    };
  }
}