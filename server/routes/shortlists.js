import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { toggleShortlist, getShortlist } from '../controllers/shortlistController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('recruiter', 'admin'));

router.post('/', toggleShortlist);
router.get('/', getShortlist);

export default router;
