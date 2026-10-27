/**
 * Wraps an async Express route or middleware so rejected promises forward to next(err).
 */
export function asyncHandler(fn) {
  return function wrappedAsyncMiddleware(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
