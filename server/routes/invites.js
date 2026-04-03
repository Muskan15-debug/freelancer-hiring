import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  sendInvite,
  getMyInvites,
  respondToInvite,
  assignPM,
  getInviteMessages,
  sendInviteMessage,
} from '../controllers/inviteController.js';

const router = express.Router();

// All invite routes require authentication
router.use(authenticate);

// Send an invite (recruiter only)
router.post('/', authorizeRoles('recruiter'), sendInvite);

// Get my invites (recruiter sees sent, freelancer/agency sees received)
router.get('/', getMyInvites);

// Respond to an invite (freelancer or agency)
router.patch('/:id/respond', authorizeRoles('freelancer', 'agency'), respondToInvite);

// Assign a PM to an accepted invite (recruiter only)
router.patch('/:id/assign-pm', authorizeRoles('recruiter'), assignPM);

// Per-invite message thread
router.get('/:id/messages', getInviteMessages);
router.post('/:id/messages', sendInviteMessage);

export default router;
