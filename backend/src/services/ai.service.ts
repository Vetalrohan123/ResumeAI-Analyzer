import "dotenv/config";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export interface ResumeAIAnalysis {
  score: number;

  name: string | null;

  email: string | null;

  phone: string | null;

  summary: string;

  skills: string[];

  experience: Array<{
    company?: string;
    role?: string;
    position?: string;
    duration?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;

  education: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    duration?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;

  projects: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    url?: string;
  }>;

  certifications: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;

  strengths: string[];

  weaknesses: string[];

  suggestions: string[];
}

/*
|--------------------------------------------------------------------------
| JOB MATCHING RESULT
|--------------------------------------------------------------------------
*/

export interface ResumeJobMatch {
  matchScore: number;

  skillsScore: number;

  experienceScore: number;

  educationScore: number;

  matchedSkills: string[];

  missingSkills: string[];

  matchedExperience: string[];

  strengths: string[];

  weaknesses: string[];

  recommendations: string[];

  summary: string;
}

/*
|--------------------------------------------------------------------------
| GEMINI RESPONSE
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
| AI SERVICE
|--------------------------------------------------------------------------
*/

export class AIService {
  /*
  |--------------------------------------------------------------------------
  | CONFIGURATION
  |--------------------------------------------------------------------------
  */

  private static readonly API_KEY =
    process.env.GEMINI_API_KEY;

  /*
   * Put the model you have access to in .env.
   *
   * Example:
   *
   * GEMINI_MODEL=gemini-2.5-flash
   *
   * Keeping it configurable prevents the application from breaking
   * when Google changes model availability.
   */

  private static readonly MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash";

  private static readonly API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${AIService.MODEL}:generateContent`;

  /*
  |--------------------------------------------------------------------------
  | LIMITS
  |--------------------------------------------------------------------------
  */

  private static readonly MAX_RESUME_LENGTH = 30000;

  private static readonly MAX_JOB_LENGTH = 20000;

  /*
  |--------------------------------------------------------------------------
  | ANALYZE RESUME
  |--------------------------------------------------------------------------
  */

  static async analyzeResume(
    resumeText: string
  ): Promise<ResumeAIAnalysis> {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE API KEY
    |--------------------------------------------------------------------------
    */

    this.validateApiKey();

    /*
    |--------------------------------------------------------------------------
    | VALIDATE RESUME
    |--------------------------------------------------------------------------
    */

    if (
      !resumeText ||
      !resumeText.trim()
    ) {
      throw new Error(
        "Resume text is required for AI analysis."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CLEAN RESUME
    |--------------------------------------------------------------------------
    */

    const cleanedResumeText =
      resumeText
        .trim()
        .slice(
          0,
          this.MAX_RESUME_LENGTH
        );

    /*
    |--------------------------------------------------------------------------
    | PROMPT
    |--------------------------------------------------------------------------
    */

    const prompt = `
You are an expert ATS resume analyzer and technical recruiter.

Analyze the following resume carefully.

Your task is to:

1. Extract candidate information.
2. Calculate an ATS score from 0 to 100.
3. Identify technical and professional skills.
4. Extract work experience.
5. Extract education.
6. Extract projects.
7. Extract certifications.
8. Identify strengths.
9. Identify weaknesses.
10. Provide actionable resume improvement suggestions.

IMPORTANT RULES:

- Do not invent information.
- Do not assume missing information.
- If information is unavailable, use null or an empty array.
- Keep extracted information faithful to the resume.
- ATS score must be an integer between 0 and 100.
- Return ONLY valid JSON.
- Do not use Markdown.
- Do not use code fences.
- Do not include explanations outside JSON.

Use exactly this JSON structure:

{
  "score": 0,
  "name": null,
  "email": null,
  "phone": null,
  "summary": "",
  "skills": [],
  "experience": [],
  "education": [],
  "projects": [],
  "certifications": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Experience objects should follow:

{
  "company": "",
  "role": "",
  "position": "",
  "duration": "",
  "startDate": "",
  "endDate": "",
  "description": ""
}

Education objects should follow:

{
  "institution": "",
  "degree": "",
  "field": "",
  "duration": "",
  "startDate": "",
  "endDate": "",
  "description": ""
}

Project objects should follow:

{
  "name": "",
  "description": "",
  "technologies": [],
  "url": ""
}

Certification objects should follow:

{
  "name": "",
  "issuer": "",
  "date": ""
}

ATS scoring should consider:

- Skills
- Technical relevance
- Work experience
- Education
- Projects
- Certifications
- Resume structure
- Keywords
- Measurable achievements
- Clarity
- Professional language
- ATS readability

RESUME:

${cleanedResumeText}
`;

    /*
    |--------------------------------------------------------------------------
    | REQUEST
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
        temperature: 0.2,

        responseMimeType:
          "application/json",

        maxOutputTokens: 8192,
      },
    };

    /*
    |--------------------------------------------------------------------------
    | CALL GEMINI
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "🤖 Gemini resume analysis started"
    );

    console.log(
      "📄 Resume characters:",
      cleanedResumeText.length
    );

    console.log(
      "🤖 Model:",
      this.MODEL
    );

    console.log(
      "========================================"
    );

    const response =
      await this.sendGeminiRequest(
        requestBody
      );

    /*
    |--------------------------------------------------------------------------
    | EXTRACT RESPONSE
    |--------------------------------------------------------------------------
    */

    const generatedText =
      this.extractGeneratedText(
        response
      );

    /*
    |--------------------------------------------------------------------------
    | PARSE
    |--------------------------------------------------------------------------
    */

    const parsedAnalysis =
      this.parseAIResponse(
        generatedText
      );

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE
    |--------------------------------------------------------------------------
    */

    const normalizedAnalysis =
      this.normalizeAnalysis(
        parsedAnalysis
      );

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "✅ Resume analysis completed"
    );

    console.log(
      "📊 ATS Score:",
      normalizedAnalysis.score
    );

    console.log(
      "========================================"
    );

    return normalizedAnalysis;
  }

  /*
  |--------------------------------------------------------------------------
  | MATCH RESUME TO JOB
  |--------------------------------------------------------------------------
  */

  static async matchResumeToJob(
    resumeText: string,
    jobDescription: string
  ): Promise<ResumeJobMatch> {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE API KEY
    |--------------------------------------------------------------------------
    */

    this.validateApiKey();

    /*
    |--------------------------------------------------------------------------
    | VALIDATE RESUME
    |--------------------------------------------------------------------------
    */

    if (
      !resumeText ||
      !resumeText.trim()
    ) {
      throw new Error(
        "Resume text is required for job matching."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE JOB
    |--------------------------------------------------------------------------
    */

    if (
      !jobDescription ||
      !jobDescription.trim()
    ) {
      throw new Error(
        "Job description is required for job matching."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CLEAN INPUT
    |--------------------------------------------------------------------------
    */

    const cleanedResume =
      resumeText
        .trim()
        .slice(
          0,
          this.MAX_RESUME_LENGTH
        );

    const cleanedJob =
      jobDescription
        .trim()
        .slice(
          0,
          this.MAX_JOB_LENGTH
        );

    /*
    |--------------------------------------------------------------------------
    | PROMPT
    |--------------------------------------------------------------------------
    */

    const prompt = `
You are an expert ATS recruitment and resume matching system.

Compare the candidate resume against the job description.

Your goal is to determine how well the candidate fits this specific job.

Analyze:

1. Overall match
2. Technical skills
3. Professional skills
4. Work experience
5. Job responsibilities
6. Education
7. Projects
8. Certifications
9. Keywords
10. Missing requirements
11. Candidate strengths
12. Candidate weaknesses
13. Actionable recommendations

IMPORTANT RULES:

- Do NOT invent information.
- Do NOT assume the candidate has a skill that is not present.
- Do NOT give credit for similar technologies unless the resume explicitly demonstrates the required technology.
- Only mark a skill as matched when the resume clearly demonstrates it.
- Missing skills should contain important requirements from the job that are not demonstrated in the resume.
- Scores must be integers from 0 to 100.
- Be objective.
- Return ONLY valid JSON.
- Do not use Markdown.
- Do not use code fences.
- Do not include explanations outside JSON.

Return exactly this structure:

{
  "matchScore": 0,
  "skillsScore": 0,
  "experienceScore": 0,
  "educationScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "matchedExperience": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "summary": ""
}

SCORING:

matchScore:
Overall compatibility between the candidate and the job.

skillsScore:
How well the candidate's demonstrated skills match the job.

experienceScore:
How well the candidate's professional experience matches the job.

educationScore:
How well the candidate's education matches the job requirements.

Use professional judgment.

Approximate importance:

Skills: 40%
Experience: 30%
Education: 15%
Projects, certifications and other relevance: 15%

MATCHED SKILLS:

Include skills clearly present in the resume and relevant to the job.

MISSING SKILLS:

Include important skills explicitly required by the job but not demonstrated in the resume.

MATCHED EXPERIENCE:

Describe relevant experience from the resume that supports the job requirements.

STRENGTHS:

Identify the strongest aspects of the candidate for this specific position.

WEAKNESSES:

Identify the largest gaps between the candidate and the job.

RECOMMENDATIONS:

Provide practical recommendations for improving the resume's match.

JOB DESCRIPTION:

${cleanedJob}

CANDIDATE RESUME:

${cleanedResume}
`;

    /*
    |--------------------------------------------------------------------------
    | REQUEST BODY
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
        temperature: 0.2,

        responseMimeType:
          "application/json",

        maxOutputTokens: 8192,
      },
    };

    /*
    |--------------------------------------------------------------------------
    | CALL GEMINI
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "🤖 Gemini job matching started"
    );

    console.log(
      "📄 Resume characters:",
      cleanedResume.length
    );

    console.log(
      "💼 Job characters:",
      cleanedJob.length
    );

    console.log(
      "🤖 Model:",
      this.MODEL
    );

    console.log(
      "========================================"
    );

    const response =
      await this.sendGeminiRequest(
        requestBody
      );

    /*
    |--------------------------------------------------------------------------
    | EXTRACT RESPONSE
    |--------------------------------------------------------------------------
    */

    const generatedText =
      this.extractGeneratedText(
        response
      );

    /*
    |--------------------------------------------------------------------------
    | PARSE
    |--------------------------------------------------------------------------
    */

    const parsedResult =
      this.parseAIResponse(
        generatedText
      );

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE
    |--------------------------------------------------------------------------
    */

    const normalizedResult =
      this.normalizeJobMatch(
        parsedResult
      );

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "✅ Job matching completed"
    );

    console.log(
      "📊 Match score:",
      normalizedResult.matchScore
    );

    console.log(
      "🎯 Skills score:",
      normalizedResult.skillsScore
    );

    console.log(
      "💼 Experience score:",
      normalizedResult.experienceScore
    );

    console.log(
      "🎓 Education score:",
      normalizedResult.educationScore
    );

    console.log(
      "========================================"
    );

    return normalizedResult;
  }

  /*
  |--------------------------------------------------------------------------
  | COMPATIBILITY METHOD
  |--------------------------------------------------------------------------
  |
  | Your MatchService may call:
  |
  | AIService.matchResumeWithJob(...)
  |
  | This method keeps that code working.
  |--------------------------------------------------------------------------
  */

  static async matchResumeWithJob(
    resumeText: string,
    jobDescription: string,
    _jobRequirements?: unknown
  ): Promise<ResumeJobMatch> {
    return this.matchResumeToJob(
      resumeText,
      jobDescription
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE API KEY
  |--------------------------------------------------------------------------
  */

  private static validateApiKey(): void {
    if (!this.API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not configured."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SEND GEMINI REQUEST
  |--------------------------------------------------------------------------
  */

  private static async sendGeminiRequest(
    requestBody: unknown
  ): Promise<GeminiResponse> {
    try {
      const response =
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

      const responseText =
        await response.text();

      let responseData:
        | GeminiResponse
        | null = null;

      try {
        responseData =
          JSON.parse(
            responseText
          ) as GeminiResponse;
      } catch {
        throw new Error(
          `Gemini returned invalid JSON response. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        console.error(
          "❌ Gemini API error:",
          responseData
        );

        throw new Error(
          responseData.error?.message ||
            `Gemini API request failed with status ${response.status}`
        );
      }

      return responseData;
    } catch (error) {
      console.error(
        "❌ Gemini request failed:",
        error
      );

      if (
        error instanceof Error
      ) {
        throw error;
      }

      throw new Error(
        "Failed to communicate with Gemini API."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | EXTRACT GENERATED TEXT
  |--------------------------------------------------------------------------
  */

  private static extractGeneratedText(
    response: GeminiResponse
  ): string {
    const generatedText =
      response
        .candidates?.[0]
        ?.content?.parts?.[0]
        ?.text;

    if (!generatedText) {
      console.error(
        "❌ Gemini returned no generated text:",
        response
      );

      throw new Error(
        "Gemini returned an empty AI response."
      );
    }

    return generatedText;
  }

  /*
  |--------------------------------------------------------------------------
  | PARSE AI RESPONSE
  |--------------------------------------------------------------------------
  */

  private static parseAIResponse(
    text: string
  ): any {
    let cleanedText =
      text.trim();

    /*
    |--------------------------------------------------------------------------
    | REMOVE CODE FENCES
    |--------------------------------------------------------------------------
    */

    cleanedText =
      cleanedText
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();

    /*
    |--------------------------------------------------------------------------
    | DIRECT JSON
    |--------------------------------------------------------------------------
    */

    try {
      return JSON.parse(
        cleanedText
      );
    } catch {
      /*
      |--------------------------------------------------------------------------
      | EXTRACT JSON OBJECT
      |--------------------------------------------------------------------------
      */

      const start =
        cleanedText.indexOf(
          "{"
        );

      const end =
        cleanedText.lastIndexOf(
          "}"
        );

      if (
        start !== -1 &&
        end !== -1 &&
        end > start
      ) {
        const jsonText =
          cleanedText.slice(
            start,
            end + 1
          );

        try {
          return JSON.parse(
            jsonText
          );
        } catch {
          // Continue to error.
        }
      }
    }

    console.error(
      "❌ Unable to parse Gemini response:"
    );

    console.error(text);

    throw new Error(
      "AI returned invalid JSON."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE RESUME ANALYSIS
  |--------------------------------------------------------------------------
  */

  private static normalizeAnalysis(
    analysis: any
  ): ResumeAIAnalysis {
    /*
    |--------------------------------------------------------------------------
    | SCORE
    |--------------------------------------------------------------------------
    */

    const score =
      this.normalizeScore(
        analysis?.score
      );

    /*
    |--------------------------------------------------------------------------
    | BASIC HELPERS
    |--------------------------------------------------------------------------
    */

    const normalizeString = (
      value: unknown
    ): string => {
      if (
        typeof value ===
        "string"
      ) {
        return value.trim();
      }

      return "";
    };

    const normalizeNullableString = (
      value: unknown
    ): string | null => {
      if (
        typeof value ===
          "string" &&
        value.trim()
      ) {
        return value.trim();
      }

      return null;
    };

    /*
    |--------------------------------------------------------------------------
    | SKILLS
    |--------------------------------------------------------------------------
    */

    const skills =
      this.normalizeStringArray(
        analysis?.skills
      );

    /*
    |--------------------------------------------------------------------------
    | EXPERIENCE
    |--------------------------------------------------------------------------
    */

    const experience =
      Array.isArray(
        analysis?.experience
      )
        ? analysis.experience
            .filter(
              (item: any) =>
                item &&
                typeof item ===
                  "object"
            )
            .map(
              (item: any) => ({
                company:
                  normalizeString(
                    item.company
                  ),

                role:
                  normalizeString(
                    item.role ||
                      item.position
                  ),

                position:
                  normalizeString(
                    item.position ||
                      item.role
                  ),

                duration:
                  normalizeString(
                    item.duration
                  ),

                startDate:
                  normalizeString(
                    item.startDate
                  ),

                endDate:
                  normalizeString(
                    item.endDate
                  ),

                description:
                  normalizeString(
                    item.description
                  ),
              })
            )
        : [];

    /*
    |--------------------------------------------------------------------------
    | EDUCATION
    |--------------------------------------------------------------------------
    */

    const education =
      Array.isArray(
        analysis?.education
      )
        ? analysis.education
            .filter(
              (item: any) =>
                item &&
                typeof item ===
                  "object"
            )
            .map(
              (item: any) => ({
                institution:
                  normalizeString(
                    item.institution
                  ),

                degree:
                  normalizeString(
                    item.degree
                  ),

                field:
                  normalizeString(
                    item.field
                  ),

                duration:
                  normalizeString(
                    item.duration
                  ),

                startDate:
                  normalizeString(
                    item.startDate
                  ),

                endDate:
                  normalizeString(
                    item.endDate
                  ),

                description:
                  normalizeString(
                    item.description
                  ),
              })
            )
        : [];

    /*
    |--------------------------------------------------------------------------
    | PROJECTS
    |--------------------------------------------------------------------------
    */

    const projects =
      Array.isArray(
        analysis?.projects
      )
        ? analysis.projects
            .filter(
              (item: any) =>
                item &&
                typeof item ===
                  "object"
            )
            .map(
              (item: any) => ({
                name:
                  normalizeString(
                    item.name
                  ),

                description:
                  normalizeString(
                    item.description
                  ),

                technologies:
                  this.normalizeStringArray(
                    item.technologies
                  ),

                url:
                  normalizeString(
                    item.url
                  ),
              })
            )
        : [];

    /*
    |--------------------------------------------------------------------------
    | CERTIFICATIONS
    |--------------------------------------------------------------------------
    */

    const certifications =
      Array.isArray(
        analysis?.certifications
      )
        ? analysis.certifications
            .filter(
              (item: any) =>
                item &&
                typeof item ===
                  "object"
            )
            .map(
              (item: any) => ({
                name:
                  normalizeString(
                    item.name
                  ),

                issuer:
                  normalizeString(
                    item.issuer
                  ),

                date:
                  normalizeString(
                    item.date
                  ),
              })
            )
        : [];

    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return {
      score,

      name:
        normalizeNullableString(
          analysis?.name
        ),

      email:
        normalizeNullableString(
          analysis?.email
        ),

      phone:
        normalizeNullableString(
          analysis?.phone
        ),

      summary:
        normalizeString(
          analysis?.summary
        ),

      skills,

      experience,

      education,

      projects,

      certifications,

      strengths:
        this.normalizeStringArray(
          analysis?.strengths
        ),

      weaknesses:
        this.normalizeStringArray(
          analysis?.weaknesses
        ),

      suggestions:
        this.normalizeStringArray(
          analysis?.suggestions
        ),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE JOB MATCH
  |--------------------------------------------------------------------------
  */

  private static normalizeJobMatch(
    result: any
  ): ResumeJobMatch {
    return {
      matchScore:
        this.normalizeScore(
          result?.matchScore
        ),

      skillsScore:
        this.normalizeScore(
          result?.skillsScore
        ),

      experienceScore:
        this.normalizeScore(
          result?.experienceScore
        ),

      educationScore:
        this.normalizeScore(
          result?.educationScore
        ),

      matchedSkills:
        this.normalizeStringArray(
          result?.matchedSkills
        ),

      missingSkills:
        this.normalizeStringArray(
          result?.missingSkills
        ),

      matchedExperience:
        this.normalizeStringArray(
          result?.matchedExperience
        ),

      strengths:
        this.normalizeStringArray(
          result?.strengths
        ),

      weaknesses:
        this.normalizeStringArray(
          result?.weaknesses
        ),

      recommendations:
        this.normalizeStringArray(
          result?.recommendations
        ),

      summary:
        typeof result?.summary ===
        "string"
          ? result.summary.trim()
          : "",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE SCORE
  |--------------------------------------------------------------------------
  */

  private static normalizeScore(
    value: unknown
  ): number {
    const number =
      Number(value);

    if (
      !Number.isFinite(number)
    ) {
      return 0;
    }

    return Math.round(
      Math.max(
        0,
        Math.min(
          100,
          number
        )
      )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE STRING ARRAY
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
        (item) =>
          typeof item ===
          "string"
      )
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);
  }
}