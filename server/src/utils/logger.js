const SENSITIVE_KEYS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'passwordHash',
  'token',
  'jwt',
  'cookie',
  'authorization',
  'x-internal-api-key',
]);

function redactObject(input) {
  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(redactObject);

  const sanitized = {};
  for (const [key, val] of Object.entries(input)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = redactObject(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export const logger = {
  info(message, meta) {
    if (process.env.NODE_ENV === 'test') return;
    const extra = meta ? ` ${JSON.stringify(redactObject(meta))}` : '';
    console.log(`[${new Date().toISOString()}] INFO: ${message}${extra}`);
  },
  warn(message, meta) {
    if (process.env.NODE_ENV === 'test') return;
    const extra = meta ? ` ${JSON.stringify(redactObject(meta))}` : '';
    console.warn(`[${new Date().toISOString()}] WARN: ${message}${extra}`);
  },
  error(message, meta) {
    if (process.env.NODE_ENV === 'test') return;
    const extra = meta ? ` ${JSON.stringify(redactObject(meta))}` : '';
    console.error(`[${new Date().toISOString()}] ERROR: ${message}${extra}`);
  },
};
