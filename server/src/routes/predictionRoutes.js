import { Router } from 'express';
import {
  createPrediction,
  deletePrediction,
  getPredictionById,
  getUserPredictions,
} from '../controllers/predictionController.js';
import { protect } from '../middleware/auth.js';
import { predictRateLimiter } from '../middleware/security.js';
import {
  uploadSingleLeafImage,
  validateAndPersistLeafImage,
} from '../middleware/upload.js';

const router = Router();

router.post(
  '/predict',
  protect,
  predictRateLimiter,
  uploadSingleLeafImage,
  validateAndPersistLeafImage,
  createPrediction
);

router.get('/predictions', protect, getUserPredictions);
router.get('/predictions/:id', protect, getPredictionById);
router.delete('/predictions/:id', protect, deletePrediction);

export default router;
