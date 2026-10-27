import { Router } from 'express';
import {
  getAdminStats,
  listAdminPredictions,
  listAdminUsers,
  updateUserRole,
  updateUserStatus,
} from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', listAdminUsers);
router.get('/predictions', listAdminPredictions);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);

export default router;
