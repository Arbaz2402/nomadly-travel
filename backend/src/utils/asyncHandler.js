/**
 * Wraps asynchronous Express route handlers to automatically catch any rejected promises
 * and forward them to the centralized Express error-handling middleware.
 *
 * @param {Function} fn - Async Express route handler (req, res, next)
 * @returns {Function} Express middleware handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
