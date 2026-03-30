import { Router } from 'express';
import { getUsers, updateUser, getPendingAgencies, updateAgency, getAnalytics, getAdminDisputes } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.get('/agencies/pending', getPendingAgencies);
router.patch('/agencies/:id', updateAgency);
router.get('/analytics', getAnalytics);
router.get('/disputes', getAdminDisputes);

export default router;
