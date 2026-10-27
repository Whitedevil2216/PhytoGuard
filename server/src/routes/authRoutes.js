import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/security.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage('Full name must be between 2 and 80 characters.'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters.'),
  ],
  validateRequest,
  registerUser
);

router.post(
  '/login',
  authRateLimiter,
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('password')
      .notEmpty()
      .withMessage('Password is required.'),
  ],
  validateRequest,
  loginUser
);

router.post('/logout', logoutUser);

router.get('/me', protect, getCurrentUser);

const profileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Full name must be between 2 and 80 characters.'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Location cannot exceed 120 characters.'),
  body('preferredLanguage')
    .optional()
    .isIn(['en-IN', 'en-US', 'ta-IN'])
    .withMessage('Unsupported language preference.'),
];

router.put('/profile', protect, profileValidation, validateRequest, updateProfile);
router.patch('/profile', protect, profileValidation, validateRequest, updateProfile);

export default router;
