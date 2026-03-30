import { Router } from 'express';
import { createApplication, getApplications, updateApplicationStatus } from '../controllers/applicationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createApplicationSchema, applicationStatusSchema } from '../validators/application.js';

const router = Router();
router.post('/:id/applications', authenticate, requireRole('freelancer', 'agency'), validate(createApplicationSchema), createApplication);
router.get('/:id/applications', authenticate, getApplications);
router.patch('/:id/applications/:appId/status', authenticate, validate(applicationStatusSchema), updateApplicationStatus);

export default router;
