import { Router } from 'express';
import { createDispute, getDisputes, getDispute, updateDisputeStatus } from '../controllers/disputeController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createDisputeSchema, disputeStatusSchema } from '../validators/dispute.js';

const router = Router();
router.post('/', authenticate, validate(createDisputeSchema), createDispute);
router.get('/', authenticate, getDisputes);
router.get('/:id', authenticate, getDispute);
router.patch('/:id/status', authenticate, validate(disputeStatusSchema), updateDisputeStatus);

export default router;
