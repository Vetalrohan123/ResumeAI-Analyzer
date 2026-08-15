export interface ExportAnalysisData {
  resumeName?: string;
  jobTitle?: string;

  atsScore?: number;
  jobMatch?: number;
  keywordScore?: number;
  skillsScore?: number;
  formattingScore?: number;
  experienceScore?: number;

  matchedKeywords?: string[];
  missingKeywords?: string[];
  recommendedKeywords?: string[];

  skills?: {
    name: string;
    score: number;
  }[];

  sections?: {
    name: string;
    score: number;
    status: string;
    recommendation: string;
  }[];

  recommendations?: {
    priority: string;
    title: string;
    description: string;
  }[];
}

/*
|--------------------------------------------------------------------------
| Escape HTML
|--------------------------------------------------------------------------
*/

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
|--------------------------------------------------------------------------
| Score Color
|--------------------------------------------------------------------------
*/

function scoreColor(score: number): string {
  if (score >= 80) {
    return "#059669";
  }

  if (score >= 60) {
    return "#d97706";
  }

  return "#dc2626";
}

/*
|--------------------------------------------------------------------------
| Recommendation Color
|--------------------------------------------------------------------------
*/

function recommendationColor(priority: string): string {
  if (priority === "High") {
    return "#dc2626";
  }

  if (priority === "Medium") {
    return "#d97706";
  }

  return "#6b7280";
}

/*
|--------------------------------------------------------------------------
| Keyword List
|--------------------------------------------------------------------------
*/

function createKeywordList(
  items: string[] = []
): string {
  if (!items.length) {
    return `
      <p class="empty">
        No items available.
      </p>
    `;
  }

  return `
    <div class="keyword-list">
      ${items
        .map(
          (item) => `
            <span class="keyword">
              ${escapeHtml(item)}
            </span>
          `
        )
        .join("")}
    </div>
  `;
}

/*
|--------------------------------------------------------------------------
| Export Analysis As PDF
|--------------------------------------------------------------------------
|
| Opens a print-friendly report in a new browser window.
| The browser print dialog can then be used to save as PDF.
|--------------------------------------------------------------------------
*/

export function exportAnalysisAsPDF(
  analysis: ExportAnalysisData
): void {
  if (typeof window === "undefined") {
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Open Popup
  |--------------------------------------------------------------------------
  */

  const popup = window.open(
    "",
    "_blank",
    "width=1100,height=900"
  );

  if (!popup) {
    alert(
      "Please allow pop-ups to export the analysis report."
    );

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize Scores
  |--------------------------------------------------------------------------
  */

  const atsScore = Number(
    analysis.atsScore ?? 0
  );

  const jobMatch = Number(
    analysis.jobMatch ?? 0
  );

  const keywordScore = Number(
    analysis.keywordScore ?? 0
  );

  const skillsScore = Number(
    analysis.skillsScore ?? 0
  );

  const formattingScore = Number(
    analysis.formattingScore ?? 0
  );

  const experienceScore = Number(
    analysis.experienceScore ?? 0
  );

  /*
  |--------------------------------------------------------------------------
  | Generated Date
  |--------------------------------------------------------------------------
  */

  const generatedAt =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(new Date());

  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  const skills =
    analysis.skills ?? [];

  const sections =
    analysis.sections ?? [];

  const recommendations =
    analysis.recommendations ?? [];

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  const atsStatus =
    atsScore >= 80
      ? "Excellent"
      : atsScore >= 60
        ? "Good"
        : "Needs Improvement";

  /*
  |--------------------------------------------------------------------------
  | HTML Report
  |--------------------------------------------------------------------------
  */

  popup.document.write(`
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    AI Resume Analysis -
    ${escapeHtml(
      analysis.resumeName || "Resume"
    )}
  </title>

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #18181b;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
      line-height: 1.5;
    }

    .page {
      width: 100%;
      max-width: 1100px;
      margin: 0 auto;
      padding: 48px;
    }

    /*
    |--------------------------------------------------------------------------
    | Header
    |--------------------------------------------------------------------------
    */

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 30px;
      padding-bottom: 28px;
      border-bottom: 2px solid #18181b;
    }

    .brand {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #7c3aed;
    }

    h1 {
      margin: 8px 0 0;
      font-size: 32px;
      line-height: 1.2;
      font-weight: 700;
    }

    .subtitle {
      margin-top: 8px;
      color: #71717a;
      font-size: 14px;
    }

    .meta {
      text-align: right;
      color: #71717a;
      font-size: 11px;
    }

    .meta strong {
      display: block;
      margin-bottom: 4px;
      color: #18181b;
      font-size: 13px;
    }

    /*
    |--------------------------------------------------------------------------
    | Hero
    |--------------------------------------------------------------------------
    */

    .hero {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 20px;
      margin-top: 28px;
    }

    .score-main {
      display: flex;
      align-items: center;
      gap: 28px;
      padding: 28px;
      border: 1px solid #e4e4e7;
      border-radius: 16px;
    }

    .score-circle {
      width: 130px;
      height: 130px;
      flex-shrink: 0;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      border: 10px solid #8b5cf6;
      border-radius: 50%;
    }

    .score-circle strong {
      font-size: 38px;
      line-height: 1;
    }

    .score-circle span {
      margin-top: 6px;
      font-size: 11px;
      color: #71717a;
    }

    .score-title {
      font-size: 18px;
      font-weight: 700;
    }

    .score-description {
      margin-top: 7px;
      color: #71717a;
      font-size: 13px;
    }

    .score-status {
      display: inline-block;
      margin-top: 14px;
      padding: 5px 10px;
      border-radius: 999px;
      background: #ecfdf5;
      color: #047857;
      font-size: 11px;
      font-weight: 600;
    }

    /*
    |--------------------------------------------------------------------------
    | Score Grid
    |--------------------------------------------------------------------------
    */

    .score-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .score-box {
      padding: 18px;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
    }

    .score-box span {
      display: block;
      color: #71717a;
      font-size: 11px;
    }

    .score-box strong {
      display: block;
      margin-top: 7px;
      font-size: 25px;
    }

    /*
    |--------------------------------------------------------------------------
    | Sections
    |--------------------------------------------------------------------------
    */

    .section {
      margin-top: 28px;
      page-break-inside: avoid;
    }

    .section-title {
      margin-bottom: 14px;
      padding-bottom: 9px;
      border-bottom: 1px solid #e4e4e7;
      font-size: 19px;
      font-weight: 700;
    }

    .section-description {
      margin-top: -8px;
      margin-bottom: 18px;
      color: #71717a;
      font-size: 12px;
    }

    /*
    |--------------------------------------------------------------------------
    | Keywords
    |--------------------------------------------------------------------------
    */

    .keyword-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .keyword {
      display: inline-block;
      padding: 6px 10px;
      border: 1px solid #d4d4d8;
      border-radius: 7px;
      background: #fafafa;
      color: #3f3f46;
      font-size: 11px;
    }

    .keyword-section {
      margin-bottom: 18px;
    }

    .keyword-heading {
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 700;
    }

    .matched {
      color: #047857;
    }

    .missing {
      color: #dc2626;
    }

    .recommended {
      color: #b45309;
    }

    .empty {
      margin: 0;
      color: #a1a1aa;
      font-size: 12px;
    }

    /*
    |--------------------------------------------------------------------------
    | Skills
    |--------------------------------------------------------------------------
    */

    .skill {
      margin-bottom: 16px;
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
    }

    .skill-name {
      font-weight: 600;
    }

    .skill-score {
      color: #71717a;
    }

    .progress {
      width: 100%;
      height: 7px;
      overflow: hidden;
      border-radius: 999px;
      background: #e4e4e7;
    }

    .progress-bar {
      height: 100%;
      border-radius: 999px;
      background: #8b5cf6;
    }

    /*
    |--------------------------------------------------------------------------
    | Table
    |--------------------------------------------------------------------------
    */

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th {
      padding: 10px;
      text-align: left;
      background: #f4f4f5;
      color: #52525b;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .table td {
      padding: 13px 10px;
      border-bottom: 1px solid #e4e4e7;
      vertical-align: top;
      font-size: 12px;
    }

    .status {
      font-weight: 600;
    }

    /*
    |--------------------------------------------------------------------------
    | Recommendations
    |--------------------------------------------------------------------------
    */

    .recommendation {
      display: flex;
      gap: 14px;
      margin-bottom: 12px;
      padding: 16px;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
    }

    .priority {
      min-width: 55px;
      height: fit-content;
      padding: 4px 7px;
      border-radius: 999px;
      text-align: center;
      font-size: 9px;
      font-weight: 700;
    }

    .recommendation-content {
      flex: 1;
    }

    .recommendation-title {
      font-size: 13px;
      font-weight: 700;
    }

    .recommendation-description {
      margin-top: 4px;
      color: #71717a;
      font-size: 11px;
    }

    /*
    |--------------------------------------------------------------------------
    | Footer
    |--------------------------------------------------------------------------
    */

    .footer {
      margin-top: 40px;
      padding-top: 18px;
      border-top: 1px solid #e4e4e7;
      text-align: center;
      color: #a1a1aa;
      font-size: 10px;
    }

    /*
    |--------------------------------------------------------------------------
    | Print
    |--------------------------------------------------------------------------
    */

    @media print {

      @page {
        size: A4;
        margin: 12mm;
      }

      body {
        background: #ffffff;
      }

      .page {
        max-width: none;
        padding: 10px;
      }

      .no-print {
        display: none !important;
      }

      .section {
        break-inside: avoid;
      }

    }

    /*
    |--------------------------------------------------------------------------
    | Responsive
    |--------------------------------------------------------------------------
    */

    @media screen and (max-width: 800px) {

      .page {
        padding: 24px;
      }

      .header {
        flex-direction: column;
      }

      .meta {
        text-align: left;
      }

      .hero {
        grid-template-columns: 1fr;
      }

      .score-main {
        flex-direction: column;
        align-items: flex-start;
      }

    }

  </style>

</head>

<body>

  <div class="page">

    <!-- ================================================================
         HEADER
         ================================================================ -->

    <header class="header">

      <div>

        <div class="brand">
          AI Resume Intelligence
        </div>

        <h1>
          Resume Analysis Report
        </h1>

        <p class="subtitle">

          ${escapeHtml(
            analysis.resumeName || "Resume"
          )}

          ${
            analysis.jobTitle
              ? ` · ${escapeHtml(
                  analysis.jobTitle
                )}`
              : ""
          }

        </p>

      </div>

      <div class="meta">

        <strong>
          Generated Report
        </strong>

        ${escapeHtml(generatedAt)}

      </div>

    </header>


    <!-- ================================================================
         OVERALL SCORE
         ================================================================ -->

    <div class="hero">

      <div class="score-main">

        <div class="score-circle">

          <strong>
            ${Math.round(atsScore)}
          </strong>

          <span>
            out of 100
          </span>

        </div>

        <div>

          <div class="score-title">
            ATS Compatibility
          </div>

          <div class="score-description">

            Overall resume compatibility
            with applicant tracking systems
            and the selected position.

          </div>

          <span class="score-status">
            ${atsStatus}
          </span>

        </div>

      </div>


      <div class="score-grid">

        <div class="score-box">

          <span>
            Job Match
          </span>

          <strong
            style="color:${scoreColor(jobMatch)}"
          >
            ${Math.round(jobMatch)}%
          </strong>

        </div>


        <div class="score-box">

          <span>
            Keywords
          </span>

          <strong
            style="color:${scoreColor(
              keywordScore
            )}"
          >
            ${Math.round(keywordScore)}%
          </strong>

        </div>


        <div class="score-box">

          <span>
            Skills
          </span>

          <strong
            style="color:${scoreColor(
              skillsScore
            )}"
          >
            ${Math.round(skillsScore)}%
          </strong>

        </div>


        <div class="score-box">

          <span>
            Formatting
          </span>

          <strong
            style="color:${scoreColor(
              formattingScore
            )}"
          >
            ${Math.round(formattingScore)}%
          </strong>

        </div>


        <div class="score-box">

          <span>
            Experience
          </span>

          <strong
            style="color:${scoreColor(
              experienceScore
            )}"
          >
            ${Math.round(experienceScore)}%
          </strong>

        </div>

      </div>

    </div>


    <!-- ================================================================
         KEYWORD ANALYSIS
         ================================================================ -->

    <section class="section">

      <h2 class="section-title">
        Keyword Analysis
      </h2>

      <p class="section-description">

        Keywords found, missing, and
        recommended for the target role.

      </p>


      <div class="keyword-section">

        <div class="keyword-heading matched">
          Matched Keywords
        </div>

        ${createKeywordList(
          analysis.matchedKeywords
        )}

      </div>


      <div class="keyword-section">

        <div class="keyword-heading missing">
          Missing Keywords
        </div>

        ${createKeywordList(
          analysis.missingKeywords
        )}

      </div>


      <div class="keyword-section">

        <div class="keyword-heading recommended">
          Recommended Keywords
        </div>

        ${createKeywordList(
          analysis.recommendedKeywords
        )}

      </div>

    </section>


    <!-- ================================================================
         SKILLS ANALYSIS
         ================================================================ -->

    <section class="section">

      <h2 class="section-title">
        Skills Analysis
      </h2>

      <p class="section-description">

        Technical skill alignment
        with the target position.

      </p>


      ${
        skills.length
          ? skills
              .map((skill) => {

                const skillScore = Math.max(
                  0,
                  Math.min(
                    100,
                    Number(skill.score) || 0
                  )
                );

                return `
                  <div class="skill">

                    <div class="skill-header">

                      <span class="skill-name">

                        ${escapeHtml(
                          skill.name
                        )}

                      </span>

                      <span class="skill-score">

                        ${Math.round(
                          skillScore
                        )}%

                      </span>

                    </div>


                    <div class="progress">

                      <div
                        class="progress-bar"
                        style="
                          width:${skillScore}%;
                        "
                      ></div>

                    </div>

                  </div>
                `;

              })
              .join("")
          : `
              <p class="empty">
                No skill analysis available.
              </p>
            `
      }

    </section>


    <!-- ================================================================
         RESUME SECTION ANALYSIS
         ================================================================ -->

    <section class="section">

      <h2 class="section-title">
        Resume Section Analysis
      </h2>

      <p class="section-description">

        Detailed feedback for each
        section of your resume.

      </p>


      ${
        sections.length
          ? `
            <table class="table">

              <thead>

                <tr>

                  <th>
                    Section
                  </th>

                  <th>
                    Score
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Recommendation
                  </th>

                </tr>

              </thead>


              <tbody>

                ${sections
                  .map((section) => {

                    const sectionScore =
                      Math.max(
                        0,
                        Math.min(
                          100,
                          Number(
                            section.score
                          ) || 0
                        )
                      );

                    return `
                      <tr>

                        <td>

                          <strong>
                            ${escapeHtml(
                              section.name
                            )}
                          </strong>

                        </td>


                        <td>

                          <strong
                            style="
                              color:${scoreColor(
                                sectionScore
                              )}
                            "
                          >

                            ${Math.round(
                              sectionScore
                            )}

                          </strong>

                        </td>


                        <td class="status">

                          ${escapeHtml(
                            section.status
                          )}

                        </td>


                        <td>

                          ${escapeHtml(
                            section.recommendation
                          )}

                        </td>

                      </tr>
                    `;

                  })
                  .join("")}

              </tbody>

            </table>
          `
          : `
              <p class="empty">
                No section analysis available.
              </p>
            `
      }

    </section>


    <!-- ================================================================
         AI RECOMMENDATIONS
         ================================================================ -->

    <section class="section">

      <h2 class="section-title">
        AI Recommendations
      </h2>

      <p class="section-description">

        Prioritized improvements for
        increasing your resume's
        compatibility.

      </p>


      ${
        recommendations.length
          ? recommendations
              .map((item) => {

                const color =
                  recommendationColor(
                    item.priority
                  );

                return `
                  <div class="recommendation">

                    <span
                      class="priority"
                      style="
                        background:${color}18;
                        color:${color};
                      "
                    >

                      ${escapeHtml(
                        item.priority
                      )}

                    </span>


                    <div
                      class="recommendation-content"
                    >

                      <div
                        class="recommendation-title"
                      >

                        ${escapeHtml(
                          item.title
                        )}

                      </div>


                      <div
                        class="recommendation-description"
                      >

                        ${escapeHtml(
                          item.description
                        )}

                      </div>

                    </div>

                  </div>
                `;

              })
              .join("")
          : `
              <p class="empty">
                No recommendations available.
              </p>
            `
      }

    </section>


    <!-- ================================================================
         FOOTER
         ================================================================ -->

    <footer class="footer">

      AI Resume Intelligence
      ·
      AI-powered resume analysis

    </footer>

  </div>


  <!-- ================================================================
       AUTO PRINT
       ================================================================ -->

  <script>

    window.onload = function () {

      setTimeout(
        function () {

          window.print();

        },
        500
      );

    };

  </script>

</body>

</html>
  `);

  /*
  |--------------------------------------------------------------------------
  | Finish Document
  |--------------------------------------------------------------------------
  */

  popup.document.close();

  popup.focus();
}