import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const AUTH_COOKIE_NAME = 'phytoguard_token';

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
      issuer: 'phytoguard-api',
    }
  );
}

export function buildAuthCookieOptions(req) {
  const isHttps =
    env.isProduction ||
    req?.secure ||
    req?.headers?.['x-forwarded-proto'] === 'https';

  return {
    httpOnly: true,
    secure: Boolean(isHttps),
    sameSite: isHttps ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export const protect = asyncHandler(async (req, _res, next) => {
  let token = '';

  if (req.cookies?.[AUTH_COOKIE_NAME]) {
    token = req.cookies[AUTH_COOKIE_NAME];
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }

  if (!token) {
    throw new ApiError(
      401,
      'Authentication required. Please sign in to continue.',
      'AUTH_REQUIRED'
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(
      401,
      'Your session token is invalid or has expired. Please sign in again.',
      'INVALID_TOKEN'
    );
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new ApiError(
      401,
      'Account associated with this session no longer exists.',
      'USER_NOT_FOUND'
    );
  }

  if (user.status !== 'active') {
    throw new ApiError(
      403,
      'This account has been deactivated by an administrator.',
      'ACCOUNT_DEACTIVATED'
    );
  }

  req.user = user;
  next();
});

export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          'Insufficient permissions for this resource.',
          'FORBIDDEN_ROLE'
        )
      );
    }
    return next();
  };
}
