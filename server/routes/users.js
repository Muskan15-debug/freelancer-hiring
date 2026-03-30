import { Router } from 'express';
import { searchUsers, getUserProfile, getMe, updateMe, markNotificationsRead } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/user.js';
import { upload, setUploadDir } from '../middleware/upload.js';

const router = Router();
router.get('/', searchUsers);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, setUploadDir('avatars'), upload.single('avatar'), validate(updateProfileSchema), updateMe);
router.put('/me/notifications/read', authenticate, markNotificationsRead);
router.get('/:id', getUserProfile);

export default router;
