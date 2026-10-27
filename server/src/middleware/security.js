import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function scrubObjectInPlace(target) {
  if (!target || typeof target !== 'object') return;

  if (Array.isArray(target)) {
    for (const item of target) {
      scrubObjectInPlace(item);
    }
    return;
  }

  for (const key of Object.keys(target)) {
    if (key.startsWith('$') || key.includes('.') || DANGEROUS_KEYS.has(key)) {
      delete target[key];
      continue;
    }
    const val = target[key];
    if (val && typeof val === 'object') {
      scrubObjectInPlace(val);
    }
  }
}

export function sanitizeNoSqlInput(req, _res, next) {
  scrubObjectInPlace(req.body);
  scrubObjectInPlace(req.params);
  scrubObjectInPlace(req.query);
  next();
}

export function enforceCsrfProtection(req, _res, next) {
  const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
  if (safeMethods.has(req.method)) {
    return next();
  }

  const isTestRuntime = process.env.NODE_ENV === 'test' || env.isTest;
  if (isTestRuntime) {
    return next();
  }

  const hasAuthCookie = Boolean(req.cookies?.phytoguard_token);
  const hasBearerHeader = Boolean(req.headers.authorization?.startsWith('Bearer '));

  if (hasAuthCookie && !hasBearerHeader) {
    const customHeader = req.headers['x-requested-with'];
    if (customHeader !== 'PhytoGuardClient') {
      return next(
        new ApiError(
          403,
          'CSRF validation failed: missing X-Requested-With client header.',
          'CSRF_VALIDATION_FAILED'
        )
      );
    }
  }

  return next();
}

const isTestMode = () => process.env.NODE_ENV === 'test' || env.isTest;

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: () => (isTestMode() ? 2000 : 25),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errorCode: 'AUTH_RATE_LIMITED',
    message: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
  },
});

export const predictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: () => (isTestMode() ? 2000 : 40),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errorCode: 'PREDICT_RATE_LIMITED',
    message: 'Leaf upload rate limit reached. Please wait a few minutes before submitting again.',
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: () => (isTestMode() ? 5000 : 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errorCode: 'API_RATE_LIMITED',
    message: 'Too many API requests from this IP address. Please retry shortly.',
  },
});
