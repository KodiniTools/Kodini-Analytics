import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate Limiter für Tracking-Endpoint
// Max 10 Requests pro Minute pro IP (verhindert Spam)
const trackingLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 60,
});

// Rate Limiter für Stats-API
// Max 60 Requests pro Minute pro IP
const statsLimiter = new RateLimiterMemory({
  points: 60,
  duration: 60,
});

/**
 * Holt die Client-IP aus dem Request
 */
function getClientIp(req: Request): string {
  // Cloudflare
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') {
    return cfIp;
  }

  // X-Forwarded-For (erster Eintrag)
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const ips = (typeof xff === 'string' ? xff : xff[0]).split(',');
    return ips[0].trim();
  }

  // X-Real-IP (Nginx)
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp;
  }

  // Fallback
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Rate Limiter Middleware für Tracking
 */
export async function trackingRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ip = getClientIp(req);
    await trackingLimiter.consume(ip);
    next();
  } catch {
    // Rate limit erreicht - still ignorieren (kein Error für User)
    res.status(204).send();
  }
}

/**
 * Rate Limiter Middleware für Stats-API
 */
export async function statsRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ip = getClientIp(req);
    await statsLimiter.consume(ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too many requests' });
  }
}
