import { Router } from 'express';
import { createProject, getProjects, getProject, updateProject, updateProjectStatus } from '../controllers/projectController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema, projectStatusSchema } from '../validators/project.js';
import { upload, setUploadDir } from '../middleware/upload.js';

const router = Router();
router.post('/', authenticate, requireRole('recruiter', 'admin'), setUploadDir('projects'), upload.array('attachments', 5), validate(createProjectSchema), createProject);
router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProject);
router.put('/:id', authenticate, setUploadDir('projects'), upload.array('attachments', 5), validate(updateProjectSchema), updateProject);
router.patch('/:id/status', authenticate, validate(projectStatusSchema), updateProjectStatus);

export default router;
