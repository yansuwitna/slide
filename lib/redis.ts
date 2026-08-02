import Redis from 'ioredis';

const globalAny: any = global;

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = globalAny.redis || new Redis(redisUrl, {
  retryStrategy: (times) => {
    // Reconnect after 3 seconds if disconnected
    return Math.min(times * 50, 3000);
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalAny.redis = redis;
}
