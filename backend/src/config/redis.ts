import "dotenv/config";

import * as IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL?.trim();

if (!REDIS_URL) {
  throw new Error(
    "REDIS_URL is not configured in environment variables."
  );
}

try {
  const redisUrl = new URL(REDIS_URL);

  console.log("================================================");
  console.log("🔴 REDIS CONFIGURATION");
  console.log("================================================");

  console.log("Host:", redisUrl.hostname);
  console.log("Port:", redisUrl.port || "6379");
  console.log("Protocol:", redisUrl.protocol);
  console.log("TLS:", redisUrl.protocol === "rediss:");

  console.log("================================================");

  if (
    redisUrl.hostname === "localhost" ||
    redisUrl.hostname === "127.0.0.1" ||
    redisUrl.hostname === "::1"
  ) {
    console.warn(
      "⚠️ WARNING: Redis is configured for localhost."
    );
  }
} catch {
  throw new Error(
    "REDIS_URL is invalid. Please use the Redis connection URL provided by Upstash."
  );
}

/* ============================================================
   REDIS CONNECTION
============================================================ */

export const redis = new IORedis.Redis(REDIS_URL, {
  maxRetriesPerRequest: null,

  enableReadyCheck: true,

  lazyConnect: false,

  retryStrategy(times: number) {
    const delay = Math.min(times * 500, 5000);

    console.log(
      `[REDIS] Reconnecting in ${delay}ms...`
    );

    return delay;
  },
});

/* ============================================================
   REDIS EVENTS
============================================================ */

redis.on("connect", () => {
  console.log("🔌 Redis connecting...");
});

redis.on("ready", () => {
  console.log("✅ Redis connected and ready");
});

redis.on("error", (error: Error) => {
  console.error(
    "❌ Redis error:",
    error.message
  );
});

redis.on("close", () => {
  console.warn("⚠️ Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

/* ============================================================
   REDIS HEALTH CHECK
============================================================ */

export async function checkRedisConnection(): Promise<boolean> {
  try {
    const response = await redis.ping();

    console.log("🏓 Redis PING:", response);

    return response === "PONG";
  } catch (error: unknown) {
    console.error(
      "❌ Redis health check failed:",
      error instanceof Error
        ? error.message
        : error
    );

    return false;
  }
}

/* ============================================================
   GRACEFUL SHUTDOWN
============================================================ */

export async function closeRedis(): Promise<void> {
  try {
    if (redis.status !== "end") {
      await redis.quit();
    }

    console.log("✅ Redis connection closed");
  } catch (error: unknown) {
    console.error(
      "❌ Error closing Redis:",
      error instanceof Error
        ? error.message
        : error
    );
  }
}