import { Router } from 'express';
import { createMilestone, getMilestones, updateMilestone, updateMilestoneStatus, deleteMilestone } from '../controllers/milestoneController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createMilestoneSchema, updateMilestoneSchema, milestoneStatusSchema } from '../validators/milestone.js';

const router = Router();
router.post('/:id/milestones', authenticate, validate(createMilestoneSchema), createMilestone);
router.get('/:id/milestones', authenticate, getMilestones);
router.put('/:id/milestones/:mId', authenticate, validate(updateMilestoneSchema), updateMilestone);
router.patch('/:id/milestones/:mId/status', authenticate, validate(milestoneStatusSchema), updateMilestoneStatus);
router.delete('/:id/milestones/:mId', authenticate, deleteMilestone);

export default router;
