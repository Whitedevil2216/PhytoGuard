import { Router } from 'express';
import { body } from 'express-validator';
import {
  createDisease,
  deleteDisease,
  getDiseaseById,
  listDiseases,
  updateDisease,
} from '../controllers/diseaseController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.get('/', listDiseases);
router.get('/:id', getDiseaseById);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('cropName').trim().notEmpty().withMessage('Crop name is required.'),
    body('diseaseName').trim().notEmpty().withMessage('Disease name is required.'),
    body('classLabel').trim().notEmpty().withMessage('PlantVillage classLabel is required.'),
    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters.'),
  ],
  validateRequest,
  createDisease
);

router.put('/:id', protect, authorize('admin'), updateDisease);
router.delete('/:id', protect, authorize('admin'), deleteDisease);

export default router;
