import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, _res, next) {
  next(
    new ApiError(
      404,
      `API endpoint not found: ${req.method} ${req.originalUrl}`,
      'ENDPOINT_NOT_FOUND'
    )
  );
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        errorCode: 'FILE_TOO_LARGE',
        message: `Image file exceeds the ${env.maxUploadMb} MB maximum upload size.`,
      });
    }
    return res.status(400).json({
      success: false,
      errorCode: 'UPLOAD_ERROR',
      message: err.message || 'Invalid multipart image upload.',
    });
  }

  if (err instanceof ApiError) {
    const payload = {
      success: false,
      errorCode: err.errorCode,
      message: err.message,
    };
    if (err.details) {
      payload.details = err.details;
    }
    return res.status(err.statusCode).json(payload);
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_IDENTIFIER',
      message: `Invalid identifier format provided for "${err.path || 'id'}".`,
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      errorCode: 'DUPLICATE_RESOURCE',
      message: 'A record with the same unique identifier already exists.',
    });
  }

  if (err?.name === 'ValidationError') {
    const firstMsg = Object.values(err.errors || {})[0]?.message || 'Database validation failed.';
    return res.status(400).json({
      success: false,
      errorCode: 'MONGOOSE_VALIDATION_ERROR',
      message: firstMsg,
    });
  }

  logger.error('Unhandled backend exception', {
    name: err?.name,
    message: err?.message,
  });

  return res.status(500).json({
    success: false,
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected server error occurred while processing your request.',
  });
}
