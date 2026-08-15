import { Queue } from "bullmq";

import { redis } from "../config/redis.js";

export const resumeQueue =
  new Queue("resume-processing", {
    connection: redis,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 5000,
      },

      removeOnComplete: {
        age: 60 * 60,
        count: 100,
      },

      removeOnFail: {
        age: 24 * 60 * 60,
        count: 500,
      },
    },
  });

/* ============================================================
   QUEUE EVENTS
============================================================ */

resumeQueue.on(
  "error",
  (error) => {
    console.error(
      "❌ Resume queue error:",
      error
    );
  }
);

/* ============================================================
   ADD RESUME JOB
============================================================ */

export interface ResumeProcessingJob {
  resumeId: string;
  userId: string;
  filePath: string;
  fileName: string;
  jobId?: string;
}

export async function addResumeProcessingJob(
  data: ResumeProcessingJob
) {
  console.log(
    "========================================"
  );

  console.log(
    "📥 ADDING RESUME TO QUEUE"
  );

  console.log(
    "========================================"
  );

  console.log(
    "📄 Resume ID:",
    data.resumeId
  );

  console.log(
    "👤 User ID:",
    data.userId
  );

  console.log(
    "📁 File:",
    data.fileName
  );

  const job =
    await resumeQueue.add(
      "process-resume",
      data,
      {
        jobId:
          `resume-${data.resumeId}`,
      }
    );

  console.log(
    "✅ Resume added to BullMQ"
  );

  console.log(
    "🆔 BullMQ Job ID:",
    job.id
  );

  return job;
}