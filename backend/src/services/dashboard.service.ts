import {
  prisma,
} from "../config/prisma.js";

export class DashboardService {

  /*
  |--------------------------------------------------------------------------
  | Get Dashboard
  |--------------------------------------------------------------------------
  */

  static async getDashboard(
    userId: string
  ) {

    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!userId) {

      throw new Error(
        "User ID is required"
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Get Recent Analyses
    |--------------------------------------------------------------------------
    */

    const analyses =
      await prisma.analysis.findMany({

        where: {

          resume: {

            uploadedById:
              userId,

          },

        },

        include: {

          resume: true,

          job: true,

        },

        orderBy: {

          createdAt:
            "desc",

        },

        take: 10,

      });


    /*
    |--------------------------------------------------------------------------
    | Latest Analysis
    |--------------------------------------------------------------------------
    */

    const latestAnalysis =
      analyses[0] ?? null;


    /*
    |--------------------------------------------------------------------------
    | Total Analyses
    |--------------------------------------------------------------------------
    */

    const totalAnalyses =
      await prisma.analysis.count({

        where: {

          resume: {

            uploadedById:
              userId,

          },

        },

      });


    /*
    |--------------------------------------------------------------------------
    | Total Resumes
    |--------------------------------------------------------------------------
    */

    const totalResumes =
      await prisma.resume.count({

        where: {

          uploadedById:
            userId,

        },

      });


    /*
    |--------------------------------------------------------------------------
    | Total Jobs
    |--------------------------------------------------------------------------
    */

    const totalJobs =
      await prisma.job.count({

        where: {

          createdById:
            userId,

        },

      });


    /*
    |--------------------------------------------------------------------------
    | Average Match Score
    |--------------------------------------------------------------------------
    */

    const scoreAggregate =
      await prisma.analysis.aggregate({

        where: {

          resume: {

            uploadedById:
              userId,

          },

        },

        _avg: {

          matchScore:
            true,

        },

      });


    const averageMatchScore =
      scoreAggregate._avg
        .matchScore ?? 0;


    /*
    |--------------------------------------------------------------------------
    | Strong Matches
    |--------------------------------------------------------------------------
    |
    | Any analysis with a match score >= 80
    | is considered a strong match.
    |
    */

    const strongMatches =
      await prisma.analysis.count({

        where: {

          resume: {

            uploadedById:
              userId,

          },

          matchScore: {

            gte: 80,

          },

        },

      });


    /*
    |--------------------------------------------------------------------------
    | Recent Analyses
    |--------------------------------------------------------------------------
    */

    const recentAnalyses =
      analyses.map(
        (analysis) => ({

          id:
            analysis.id,


          resume: {

            id:
              analysis.resume.id,

            fileName:
              analysis.resume.fileName,

            candidateName:
              analysis.resume
                .candidateName,

            aiScore:
              analysis.resume
                .aiScore,

            status:
              analysis.resume
                .status,

          },


          job: {

            id:
              analysis.job.id,

            title:
              analysis.job.title,

            company:
              analysis.job.company,

          },


          matchScore:
            analysis.matchScore,


          hiringRecommendation:
            analysis
              .hiringRecommendation,


          createdAt:
            analysis.createdAt,

        })
      );


    /*
    |--------------------------------------------------------------------------
    | Latest Analysis Details
    |--------------------------------------------------------------------------
    */

    let latest = null;


    if (latestAnalysis) {

      latest = {

        id:
          latestAnalysis.id,


        matchScore:
          latestAnalysis
            .matchScore,


        matchedSkills:
          latestAnalysis
            .matchedSkills,


        missingSkills:
          latestAnalysis
            .missingSkills,


        strengths:
          latestAnalysis
            .strengths,


        weaknesses:
          latestAnalysis
            .weaknesses,


        recommendations:
          latestAnalysis
            .recommendations,


        hiringRecommendation:
          latestAnalysis
            .hiringRecommendation,


        createdAt:
          latestAnalysis
            .createdAt,


        /*
        |--------------------------------------------------------------------------
        | Resume
        |--------------------------------------------------------------------------
        */

        resume: {

          id:
            latestAnalysis
              .resume.id,


          fileName:
            latestAnalysis
              .resume.fileName,


          candidateName:
            latestAnalysis
              .resume
              .candidateName,


          candidateEmail:
            latestAnalysis
              .resume
              .candidateEmail,


          candidatePhone:
            latestAnalysis
              .resume
              .candidatePhone,


          aiScore:
            latestAnalysis
              .resume
              .aiScore,


          status:
            latestAnalysis
              .resume
              .status,


          summary:
            latestAnalysis
              .resume
              .summary,


          skills:
            latestAnalysis
              .resume
              .skills,


          experience:
            latestAnalysis
              .resume
              .experience,


          education:
            latestAnalysis
              .resume
              .education,


          projects:
            latestAnalysis
              .resume
              .projects,


          certifications:
            latestAnalysis
              .resume
              .certifications,


          strengths:
            latestAnalysis
              .resume
              .strengths,


          weaknesses:
            latestAnalysis
              .resume
              .weaknesses,


          suggestions:
            latestAnalysis
              .resume
              .suggestions,

        },


        /*
        |--------------------------------------------------------------------------
        | Job
        |--------------------------------------------------------------------------
        */

        job: {

          id:
            latestAnalysis
              .job.id,


          title:
            latestAnalysis
              .job.title,


          company:
            latestAnalysis
              .job.company,


          location:
            latestAnalysis
              .job.location,


          employmentType:
            latestAnalysis
              .job
              .employmentType,


          description:
            latestAnalysis
              .job
              .description,


          requirements:
            latestAnalysis
              .job
              .requirements,


          salary:
            latestAnalysis
              .job
              .salary,


          requiredSkills:
            latestAnalysis
              .job
              .requiredSkills,


          status:
            latestAnalysis
              .job
              .status,

        },

      };

    }


    /*
    |--------------------------------------------------------------------------
    | Dashboard Response
    |--------------------------------------------------------------------------
    */

    return {

      stats: {

        totalAnalyses:
          totalAnalyses,


        totalResumes:
          totalResumes,


        totalJobs:
          totalJobs,


        averageMatchScore:
          Math.round(
            Number(
              averageMatchScore
            )
          ),


        strongMatches:
          strongMatches,

      },


      latestAnalysis:
        latest,


      recentAnalyses:
        recentAnalyses,

    };

  }

}