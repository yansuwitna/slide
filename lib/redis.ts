import Redis from 'ioredis';

const globalAny: any = global;

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = globalAny.redis || new Redis(redisUrl, {
  enableOfflineQueue: false, // Fail fast if Redis is down
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    return Math.min(times * 50, 3000);
  }
});

export async function checkRedisStatus(): Promise<boolean> {
  try {
    const res = await redis.ping();
    return res === "PONG";
  } catch (e) {
    return false;
  }
}

if (process.env.NODE_ENV !== 'production') {
  globalAny.redis = redis;
}
