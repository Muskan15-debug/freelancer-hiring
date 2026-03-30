import { Router } from 'express';
import { createTask, getTasks, updateTask, updateTaskStatus, deleteTask } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, taskStatusSchema } from '../validators/task.js';

const router = Router();
router.post('/:id/tasks', authenticate, validate(createTaskSchema), createTask);
router.get('/:id/tasks', authenticate, getTasks);
router.put('/:id/tasks/:taskId', authenticate, validate(updateTaskSchema), updateTask);
router.patch('/:id/tasks/:taskId/status', authenticate, validate(taskStatusSchema), updateTaskStatus);
router.delete('/:id/tasks/:taskId', authenticate, deleteTask);

export default router;
