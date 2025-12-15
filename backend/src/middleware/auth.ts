import { Request, Response, NextFunction } from 'express';

/**
 * Simple Token-basierte Authentifizierung für Stats-API
 * 
 * In Produktion: Durch robustere Lösung ersetzen (JWT, Session, etc.)
 * 
 * Konfiguration via Environment Variable: ANALYTICS_TOKEN
 */

const ANALYTICS_TOKEN = process.env.ANALYTICS_TOKEN || 'CHANGE_THIS_TOKEN_IN_PRODUCTION';

/**
 * Auth Middleware
 * Prüft Authorization Header oder Query-Parameter
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Token aus Header
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // Fallback: Query-Parameter (für einfache Tests)
  if (!token) {
    token = req.query.token as string;
  }

  // Validieren
  if (!token || token !== ANALYTICS_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}

/**
 * Optional: Auth nur in Produktion aktivieren
 */
export function conditionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // In Development: Auth überspringen
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }

  authMiddleware(req, res, next);
}
