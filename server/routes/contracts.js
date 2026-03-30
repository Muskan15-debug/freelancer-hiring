import { Router } from 'express';
import { getContracts, getContract, assignProjectManager, terminateContract } from '../controllers/contractController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { assignPmSchema, terminateContractSchema } from '../validators/contract.js';

const router = Router();
router.get('/', authenticate, getContracts);
router.get('/:id', authenticate, getContract);
router.patch('/:id/assign-pm', authenticate, validate(assignPmSchema), assignProjectManager);
router.patch('/:id/terminate', authenticate, validate(terminateContractSchema), terminateContract);

export default router;
