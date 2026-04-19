import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests, please try again later.') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const limits = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (config: RateLimitConfig) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Generate key based on userId (authenticated) or IP (unauthenticated)
    const key = req.user?.userId || req.ip || 'anonymous';
    const now = Date.now();

    const record = limits.get(key);

    if (!record || now > record.resetTime) {
      // Create new record
      limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return next();
    }

    if (record.count >= config.max) {
      logger.warn({
        event: 'RATE_LIMIT_EXCEEDED',
        userId: req.user?.userId,
        details: { path: req.path, ip: req.ip }
      });
      return next(new TooManyRequestsError());
    }

    record.count++;
    next();
  };
};

export const authRateLimit = rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }); // 20 requests per 15 min for login/register
export const debateActionRateLimit = rateLimiter({ windowMs: 60 * 1000, max: 10 }); // 10 requests per minute for arguments/votes/etc
