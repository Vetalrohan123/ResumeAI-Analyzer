import { prisma } from "../config/prisma.js";

export class HistoryService {
  static async getHistory(
    userId: string,
    page = 1,
    limit = 10,
    search = ""
  ) {
    const skip =
      (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (search.trim()) {
      where.OR = [
        {
          resume: {
            fileName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          job: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          job: {
            company: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [
      analyses,
      total,
    ] = await Promise.all([
      prisma.analysis.findMany({
        where,

        include: {
          resume: {
            select: {
              id: true,
              fileName: true,
              candidateName: true,
              aiScore: true,
              status: true,
            },
          },

          job: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,
      }),

      prisma.analysis.count({
        where,
      }),
    ]);

    return {
      analyses,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
      },
    };
  }
}