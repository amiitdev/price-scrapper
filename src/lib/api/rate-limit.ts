const requestCounts = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  identifier: string,
  maxRequests = 30,
  windowMs = 60_000,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const now = Date.now();
  const entry = requestCounts.get(identifier);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, limit: maxRequests, remaining: maxRequests - entry.count, reset: entry.resetAt };
}
