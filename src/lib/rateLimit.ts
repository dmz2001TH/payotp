// In-memory rate limiter (per-instance)
// For production with multiple instances, use Redis-based solution

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;   // Time window in ms
  max: number;        // Max requests per window
  keyPrefix?: string; // Prefix for the key
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${config.keyPrefix || 'rl'}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.max - 1, resetAt };
  }

  entry.count++;
  if (entry.count > config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

// Preset configs
export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'auth' },      // 10 attempts per 15 min
  api: { windowMs: 60 * 1000, max: 60, keyPrefix: 'api' },              // 60 per minute
  deposit: { windowMs: 60 * 1000, max: 5, keyPrefix: 'deposit' },        // 5 per minute
  sms: { windowMs: 60 * 1000, max: 30, keyPrefix: 'sms' },              // 30 per minute
  purchase: { windowMs: 60 * 1000, max: 10, keyPrefix: 'purchase' },     // 10 per minute
};
