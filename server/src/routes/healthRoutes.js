import { Router } from 'express';
import { getDbStatus } from '../config/db.js';
import { checkMlServiceHealth } from '../services/mlServiceClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const [db, mlService] = await Promise.all([
      Promise.resolve(getDbStatus()),
      checkMlServiceHealth(),
    ]);

    return res.status(200).json({
      success: true,
      service: 'phytoguard-express-api',
      timestamp: new Date().toISOString(),
      database: db,
      mlService,
    });
  })
);

export default router;
