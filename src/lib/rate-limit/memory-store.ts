import type { RateLimitStore } from "./store"

/**
 * In-memory rate limit store.
 * 
 * WARNING: This is NOT production-grade for serverless/multi-instance deployments.
 * - State is not shared across serverless function instances
 * - State is lost on cold starts
 * - Only suitable for single-instance dev/test environments
 * 
 * For production on Vercel or similar platforms, use RedisStore instead.
 */

interface RateLimitInfo {
  count: number
  resetTime: number
}

export class MemoryStore implements RateLimitStore {
  private store = new Map<string, RateLimitInfo>()
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor() {
    // Only start cleanup in Node.js runtime (not Edge)
    if (typeof setInterval !== "undefined") {
      this.cleanupTimer = setInterval(() => {
        this.cleanup()
      }, 60000) // Cleanup every minute

      // Unref timer to allow process to exit
      if (this.cleanupTimer && typeof this.cleanupTimer.unref === "function") {
        this.cleanupTimer.unref()
      }
    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const info = this.store.get(key)

    // If no entry or window expired, create new window
    if (!info || info.resetTime < now) {
      const resetTime = now + windowMs
      this.store.set(key, { count: 1, resetTime })
      return { count: 1, resetTime }
    }

    // Increment existing window
    info.count += 1
    return { count: info.count, resetTime: info.resetTime }
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, info] of this.store.entries()) {
      if (info.resetTime < now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Destroy the store and cleanup resources.
   * Call this when shutting down the application.
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.store.clear()
  }
}
