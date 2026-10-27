import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export function validateRequest(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const formatted = result.array({ onlyFirstError: true }).map((err) => ({
    field: err.path || err.param || 'request',
    message: err.msg,
  }));

  return next(
    new ApiError(
      400,
      formatted[0]?.message || 'Request validation failed.',
      'VALIDATION_ERROR',
      formatted
    )
  );
}
