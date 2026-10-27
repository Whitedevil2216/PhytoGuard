import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import {
  apiRateLimiter,
  enforceCsrfProtection,
  sanitizeNoSqlInput,
} from './middleware/security.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import diseaseRoutes from './routes/diseaseRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';

export function applyCoreMiddleware(app) {
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: false,
    })
  );

  const allowedOrigins = new Set(
    [
      env.clientUrl,
      env.appUrl,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean)
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin) || origin.endsWith('.run.app')) {
          return callback(null, true);
        }
        return callback(new Error('Origin not permitted by CORS policy.'));
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(sanitizeNoSqlInput);
  app.use('/api', apiRateLimiter);
  app.use('/api', enforceCsrfProtection);

  // Serve normalized leaf uploads safely with nosniff headers and no directory listing
  app.use(
    '/uploads',
    express.static(env.uploadDir, {
      dotfiles: 'deny',
      index: false,
      setHeaders(res) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'private, max-age=86400');
      },
    })
  );

  // Mount REST API routes
  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/diseases', diseaseRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', predictionRoutes);

  // Catch unmatched /api/* routes with structured JSON 404
  app.use('/api', notFoundHandler);
}

export function createExpressApp() {
  const app = express();
  applyCoreMiddleware(app);
  app.use(errorHandler);
  return app;
}
