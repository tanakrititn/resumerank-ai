import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from './env'

// Fallback in-memory rate limiter for development
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()

  async limit(identifier: string, limit: number, window: number) {
    const now = Date.now()
    const windowStart = now - window

    // Get existing requests for this identifier
    const existingRequests = this.requests.get(identifier) || []

    // Filter out requests outside the window
    const recentRequests = existingRequests.filter((time) => time > windowStart)

    // Check if limit exceeded
    const success = recentRequests.length < limit

    if (success) {
      recentRequests.push(now)
      this.requests.set(identifier, recentRequests)
    }

    return {
      success,
      limit,
      remaining: Math.max(0, limit - recentRequests.length - 1),
      reset: new Date(now + window),
    }
  }
}

// Initialize rate limiter
let rateLimiter: Ratelimit | InMemoryRateLimiter

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  // Production: Use Upstash Redis
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  })

  rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
    analytics: true,
  })
} else {
  // Development: Use in-memory fallback
  console.warn('⚠️  Using in-memory rate limiter (not recommended for production)')
  rateLimiter = new InMemoryRateLimiter()
}

export async function rateLimit(identifier: string) {
  if (rateLimiter instanceof InMemoryRateLimiter) {
    return await rateLimiter.limit(identifier, 10, 60000) // 10 req/min
  }
  return await rateLimiter.limit(identifier)
}

// Specific rate limiters for different actions
export async function rateLimitFileUpload(identifier: string) {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })

    const uploadLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 uploads per minute
      analytics: true,
      prefix: 'upload',
    })

    return await uploadLimiter.limit(identifier)
  }

  const inMemory = new InMemoryRateLimiter()
  return await inMemory.limit(`upload:${identifier}`, 5, 60000)
}

export async function rateLimitAIAnalysis(identifier: string) {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })

    const aiLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'), // 3 AI calls per minute
      analytics: true,
      prefix: 'ai',
    })

    return await aiLimiter.limit(identifier)
  }

  const inMemory = new InMemoryRateLimiter()
  return await inMemory.limit(`ai:${identifier}`, 3, 60000)
}
