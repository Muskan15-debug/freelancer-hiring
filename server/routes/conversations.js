import { Router } from 'express';
import { createConversation, getConversations, getMessages, sendMessage } from '../controllers/conversationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/', authenticate, createConversation);
router.get('/', authenticate, getConversations);
router.get('/:id/messages', authenticate, getMessages);
router.post('/:id/messages', authenticate, sendMessage);

export default router;
