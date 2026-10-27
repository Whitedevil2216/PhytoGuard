import { User } from '../models/User.js';
import {
  AUTH_COOKIE_NAME,
  buildAuthCookieOptions,
  signAuthToken,
} from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const registerUser = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(
      409,
      'An account with this email address already exists.',
      'DUPLICATE_EMAIL'
    );
  }

  const passwordHash = await User.hashPassword(password);

  // Public registration NEVER grants administrator privileges regardless of request body
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'user',
    status: 'active',
  });

  const token = signAuthToken(user);
  res.cookie(AUTH_COOKIE_NAME, token, buildAuthCookieOptions(req));

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: user.toJSON(),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new ApiError(
      401,
      'Invalid email address or password.',
      'INVALID_CREDENTIALS'
    );
  }

  const isPasswordValid = await user.verifyPassword(password);
  if (!isPasswordValid) {
    throw new ApiError(
      401,
      'Invalid email address or password.',
      'INVALID_CREDENTIALS'
    );
  }

  if (user.status !== 'active') {
    throw new ApiError(
      403,
      'Your account has been deactivated by an administrator.',
      'ACCOUNT_DEACTIVATED'
    );
  }

  const token = signAuthToken(user);
  res.cookie(AUTH_COOKIE_NAME, token, buildAuthCookieOptions(req));

  return res.status(200).json({
    success: true,
    message: 'Signed in successfully.',
    token,
    user: user.toJSON(),
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  const cookieOpts = buildAuthCookieOptions(req);
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Signed out cleanly.',
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user.toJSON(),
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) {
    throw new ApiError(404, 'User profile not found.', 'USER_NOT_FOUND');
  }

  if (typeof req.body.name === 'string' && req.body.name.trim()) {
    user.name = req.body.name.trim();
  }

  if (typeof req.body.location === 'string') {
    user.location = req.body.location.trim().slice(0, 120);
  }

  if (
    typeof req.body.preferredLanguage === 'string' &&
    ['en-IN', 'en-US', 'ta-IN'].includes(req.body.preferredLanguage)
  ) {
    user.preferredLanguage = req.body.preferredLanguage;
  }

  if (req.body.newPassword) {
    if (!req.body.currentPassword) {
      throw new ApiError(
        400,
        'Your current password is required to set a new password.',
        'CURRENT_PASSWORD_REQUIRED'
      );
    }

    const matchesCurrent = await user.verifyPassword(req.body.currentPassword);
    if (!matchesCurrent) {
      throw new ApiError(
        401,
        'Current password is incorrect.',
        'INVALID_CURRENT_PASSWORD'
      );
    }

    if (String(req.body.newPassword).length < 8) {
      throw new ApiError(
        400,
        'New password must be at least 8 characters long.',
        'WEAK_PASSWORD'
      );
    }

    user.passwordHash = await User.hashPassword(req.body.newPassword);
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user: user.toJSON(),
  });
});
