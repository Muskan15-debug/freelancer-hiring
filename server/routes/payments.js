import { Router } from 'express';
import { createEscrow, getPaymentHistory, refundPayment, handleWebhook } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createEscrowSchema, refundSchema } from '../validators/payment.js';

const router = Router();
router.post('/escrow', authenticate, validate(createEscrowSchema), createEscrow);
router.get('/history', authenticate, getPaymentHistory);
router.post('/refund', authenticate, requireRole('admin'), validate(refundSchema), refundPayment);
router.post('/webhook', handleWebhook); // No auth — signature verified internally

export default router;
