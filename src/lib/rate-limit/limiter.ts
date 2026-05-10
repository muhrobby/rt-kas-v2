/**
 * Rate limiter with pluggable storage backend.
 * 
 * Storage selection:
 * - Production (Redis env vars set): Uses Redis for distributed rate limiting
 * - Development/Test: Uses in-memory store (NOT production-grade)
 * 
 * The in-memory store is NOT suitable for production because:
 * - State is not shared across serverless instances
 * - State is lost on cold starts
 * - No persistence across deployments
 * 
 * Error handling:
 * - If Redis operation fails, falls back to memory store for that request
 * - Logs errors but does not block the request
 */

import type { RateLimitStore } from "./store"
import { MemoryStore } from "./memory-store"
import { RedisStore, createRedisClient } from "./redis-store"

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

let primaryStore: RateLimitStore | null = null
let fallbackStore: MemoryStore | null = null
let storeInitialized = false

/**
 * Initialize rate limit store based on environment.
 * This is called lazily on first rate limit check.
 */
async function initializeStores(): Promise<void> {
  if (storeInitialized) {
    return
  }

  storeInitialized = true

  // Always create fallback memory store
  fallbackStore = new MemoryStore()

  // Try to initialize Redis store for production
  const redisClient = await createRedisClient()
  
  if (redisClient) {
    primaryStore = new RedisStore(redisClient)
  } else {
    console.warn(
      "[RATE_LIMIT] Redis not configured. Using in-memory store. " +
      "This is NOT production-grade and will not work correctly across multiple serverless instances. " +
      "Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN or REDIS_URL for production."
    )
    primaryStore = fallbackStore
  }
}

export const rateLimit = async (
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> => {
  await initializeStores()

  // Try primary store (Redis or Memory)
  try {
    const { count, resetTime } = await primaryStore!.increment(key, windowMs)

    if (count > limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTime,
      }
    }

    return {
      success: true,
      limit,
      remaining: limit - count,
      reset: resetTime,
    }
  } catch (error) {
    // If primary store (Redis) fails, fallback to memory store
    console.error(
      "[RATE_LIMIT_ERROR] Primary store failed, falling back to memory store:",
      error instanceof Error ? error.message : String(error)
    )

    // Use fallback memory store
    if (fallbackStore && fallbackStore !== primaryStore) {
      try {
        const { count, resetTime } = await fallbackStore.increment(key, windowMs)

        if (count > limit) {
          return {
            success: false,
            limit,
            remaining: 0,
            reset: resetTime,
          }
        }

        return {
          success: true,
          limit,
          remaining: limit - count,
          reset: resetTime,
        }
      } catch (fallbackError) {
        console.error("[RATE_LIMIT_ERROR] Fallback store also failed:", fallbackError)
      }
    }

    // If both stores fail, allow the request but log the error
    // This is better than blocking all traffic due to rate limiter failure
    console.error("[RATE_LIMIT_ERROR] All stores failed, allowing request")
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + windowMs,
    }
  }
}