/**
 * Redis Cache Service
 * Provides caching layer for API responses and session data
 */

import Redis from 'ioredis';

let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance
 */
export function getRedisClient(): Redis | null {
  if (typeof window !== 'undefined') {
    // Redis should only be used server-side
    return null;
  }

  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';

    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        lazyConnect: true,
      });

      // Handle connection errors gracefully
      redisClient.on('error', (error) => {
        console.error('Redis connection error:', error);
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      return null;
    }
  }

  return redisClient;
}

/**
 * Cache service with TTL support
 */
export const cacheService = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      await client.connect();
      const value = await client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set value in cache with TTL (in seconds)
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.connect();
      const serialized = JSON.stringify(value);
      await client.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.connect();
      await client.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.connect();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.connect();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Increment counter
   */
  async increment(key: string, ttl?: number): Promise<number> {
    const client = getRedisClient();
    if (!client) return 0;

    try {
      await client.connect();
      const value = await client.incr(key);
      if (ttl) {
        await client.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Get multiple keys
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const client = getRedisClient();
    if (!client) return keys.map(() => null);

    try {
      await client.connect();
      const values = await client.mget(...keys);
      return values.map(v => v ? JSON.parse(v) as T : null);
    } catch (error) {
      console.error(`Cache mget error:`, error);
      return keys.map(() => null);
    }
  },
};

/**
 * Cache key generators
 */
export const cacheKeys = {
  triageSession: (sessionId: string) => `triage:session:${sessionId}`,
  patientProfile: (patientId: string) => `patient:profile:${patientId}`,
  doctorStats: (doctorId: string) => `doctor:stats:${doctorId}`,
  unreadNotifications: (userId: string) => `notifications:unread:${userId}`,
  notifications: (userId: string) => `notifications:list:${userId}`,
  triageHistory: (patientId: string) => `triage:history:${patientId}`,
};

/**
 * Cache TTL constants (in seconds)
 */
export const cacheTTL = {
  SHORT: 5 * 60,          // 5 minutes
  MEDIUM: 30 * 60,        // 30 minutes
  LONG: 60 * 60,          // 1 hour
  DAY: 24 * 60 * 60,      // 24 hours
};

/**
 * Gracefully close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
