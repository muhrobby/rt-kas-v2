/**
 * Rate limit store interface.
 * Implementations must be safe for concurrent access.
 */
export interface RateLimitStore {
  /**
   * Increment the counter for a key within a time window.
   * @param key - Unique identifier for the rate limit bucket
   * @param windowMs - Time window in milliseconds
   * @returns Current count and reset timestamp
   */
  increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }>;

  /**
   * Optional cleanup method for stores that need periodic maintenance.
   */
  cleanup?(): void;
}
