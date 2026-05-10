import type { RateLimitStore } from "./store"

/**
 * Redis-based rate limit store for production use.
 * 
 * This implementation uses Redis for distributed rate limiting across
 * multiple serverless instances.
 * 
 * Environment variables:
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN: For Upstash Redis (recommended for Vercel)
 * - REDIS_URL: For standard Redis with ioredis
 * 
 * Compatible with:
 * - Upstash Redis (via @upstash/redis)
 * - Vercel KV (which is Upstash Redis)
 * - Standard Redis (via ioredis)
 * 
 * Uses Redis commands:
 * - INCR: Atomic increment
 * - EXPIRE: Set TTL for automatic cleanup
 * - PTTL: Get remaining TTL
 */

interface RedisClient {
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
  pttl(key: string): Promise<number>
}

export class RedisStore implements RateLimitStore {
  private client: RedisClient

  constructor(client: RedisClient) {
    this.client = client
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    
    try {
      // Atomic increment
      const count = await this.client.incr(key)
      
      // If this is the first increment, set expiry
      if (count === 1) {
        const windowSeconds = Math.ceil(windowMs / 1000)
        await this.client.expire(key, windowSeconds)
        return { count, resetTime: now + windowMs }
      }
      
      // Get remaining TTL to calculate reset time
      const ttlMs = await this.client.pttl(key)
      
      // Handle pttl return values:
      // -2: key does not exist (race condition, treat as new window)
      // -1: key exists but has no expiry (shouldn't happen, but handle gracefully)
      // positive: remaining TTL in milliseconds
      let resetTime: number
      if (ttlMs === -2 || ttlMs === -1) {
        // Fallback: set expiry now and calculate reset time
        const windowSeconds = Math.ceil(windowMs / 1000)
        await this.client.expire(key, windowSeconds)
        resetTime = now + windowMs
      } else {
        resetTime = now + ttlMs
      }
      
      return { count, resetTime }
    } catch (error) {
      // If Redis operation fails, throw error to allow caller to handle
      // (e.g., fallback to memory store or return 500)
      console.error("[REDIS_STORE_ERROR] Redis operation failed:", error)
      throw error
    }
  }
}

/**
 * Create Redis client from environment variables.
 * Supports both Upstash Redis and standard Redis.
 * 
 * Priority:
 * 1. Upstash Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
 * 2. Standard Redis (REDIS_URL)
 */
export async function createRedisClient(): Promise<RedisClient | null> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
  const redisUrl = process.env.REDIS_URL

  // Try Upstash Redis first (recommended for Vercel)
  if (upstashUrl && upstashToken) {
    try {
      // Dynamic import to avoid build errors when package not installed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const upstashModule = await import("@upstash/redis" as any).catch(() => null)
      if (!upstashModule) {
        console.error("[REDIS_STORE_ERROR] @upstash/redis package not installed")
        return null
      }

      const { Redis } = upstashModule
      const client = new Redis({
        url: upstashUrl,
        token: upstashToken,
      })
      
      // Verify connection with a simple command
      await client.ping()
      
      console.log("[REDIS_STORE] Successfully initialized Upstash Redis client")
      return client as unknown as RedisClient
    } catch (error) {
      console.error("[REDIS_STORE_ERROR] Failed to initialize Upstash Redis:", error instanceof Error ? error.message : String(error))
      // Don't fallback to ioredis if Upstash was explicitly configured
      return null
    }
  }

  // Fallback to standard Redis with ioredis
  if (redisUrl) {
    try {
      // Dynamic import to avoid build errors when package not installed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ioredisModule = await import("ioredis" as any).catch(() => null)
      if (!ioredisModule) {
        console.error("[REDIS_STORE_ERROR] ioredis package not installed")
        return null
      }

      const IORedis = ioredisModule.default
      const client = new IORedis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        retryStrategy(times: number) {
          // Retry with exponential backoff, max 3 times
          if (times > 3) {
            return null
          }
          return Math.min(times * 100, 1000)
        },
      })
      
      await client.connect()
      await client.ping()
      
      console.log("[REDIS_STORE] Successfully initialized ioredis client")
      return client as unknown as RedisClient
    } catch (error) {
      console.error("[REDIS_STORE_ERROR] Failed to initialize ioredis:", error instanceof Error ? error.message : String(error))
      return null
    }
  }

  // No Redis configuration found
  return null
}
