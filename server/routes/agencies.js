import { Router } from 'express';
import { createAgency, getAgency, updateAgency, manageMember, updateMemberStatus } from '../controllers/agencyController.js';
import { authenticate } from '../middleware/auth.js';
import { upload, setUploadDir } from '../middleware/upload.js';

const router = Router();
router.post('/', authenticate, createAgency);
router.get('/:id', getAgency);
router.put('/:id', authenticate, setUploadDir('agencies'), upload.single('logo'), updateAgency);
router.post('/:id/members', authenticate, manageMember);
router.patch('/:id/members/:uid', authenticate, updateMemberStatus);

export default router;
