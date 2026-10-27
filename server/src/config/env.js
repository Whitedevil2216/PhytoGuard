import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '../..');

const isProduction = process.env.NODE_ENV === 'production';

const rawJwtSecret = process.env.JWT_SECRET?.trim();
if (isProduction && (!rawJwtSecret || rawJwtSecret.includes('replace_with_'))) {
  throw new Error('FATAL: A strong JWT_SECRET environment variable must be configured in production.');
}

const fallbackDevSecret = crypto
  .createHash('sha256')
  .update(`phytoguard-dev-jwt-${SERVER_ROOT}`)
  .digest('hex');

const rawUploadDir = process.env.UPLOAD_DIR || path.join(SERVER_ROOT, 'uploads');
const resolvedUploadDir = path.isAbsolute(rawUploadDir)
  ? rawUploadDir
  : path.resolve(process.cwd(), rawUploadDir);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  isTest: process.env.NODE_ENV === 'test',
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI?.trim() || '',
  jwtSecret:
    rawJwtSecret && !rawJwtSecret.includes('replace_with_')
      ? rawJwtSecret
      : fallbackDevSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  appUrl: process.env.APP_URL || '',
  modelServiceUrl: (process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, ''),
  internalApiKey:
    process.env.INTERNAL_API_KEY && !process.env.INTERNAL_API_KEY.includes('replace_with_')
      ? process.env.INTERNAL_API_KEY.trim()
      : '',
  uploadDir: resolvedUploadDir,
  maxUploadMb: Math.max(1, Number(process.env.MAX_UPLOAD_MB) || 5),
  confidenceThreshold: Math.min(0.99, Math.max(0.1, Number(process.env.CONFIDENCE_THRESHOLD) || 0.6)),
};
