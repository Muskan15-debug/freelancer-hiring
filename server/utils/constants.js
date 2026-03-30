// User roles
export const ROLES = {
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  PROJECT_MANAGER: 'projectManager',
  FREELANCER: 'freelancer',
  AGENCY: 'agency',
};

// Project statuses
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  UNDER_REVIEW: 'under_review',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled',
};

// Valid project transitions
export const PROJECT_TRANSITIONS = {
  draft: ['open', 'cancelled'],
  open: ['in_progress', 'cancelled'],
  in_progress: ['under_review', 'disputed'],
  under_review: ['completed'],
};

// Application statuses
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  SHORTLISTED: 'shortlisted',
  INVITED: 'invited',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

// Valid application transitions
export const APPLICATION_TRANSITIONS = {
  pending: ['shortlisted', 'rejected', 'withdrawn'],
  shortlisted: ['invited', 'withdrawn'],
  invited: ['accepted', 'rejected'],
};

// Contract statuses
export const CONTRACT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  TERMINATED: 'terminated',
};

// Milestone statuses
export const MILESTONE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REVISION_REQUESTED: 'revision_requested',
};

export const MILESTONE_TRANSITIONS = {
  pending: ['in_progress'],
  in_progress: ['submitted'],
  submitted: ['approved', 'revision_requested'],
  revision_requested: ['in_progress'],
};

// Task statuses
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const TASK_TRANSITIONS = {
  todo: ['in_progress'],
  in_progress: ['completed'],
  completed: ['in_progress'], // reopen
};

// Dispute statuses
export const DISPUTE_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
};

export const DISPUTE_TRANSITIONS = {
  open: ['under_review'],
  under_review: ['resolved', 'escalated'],
};

// Payment types
export const PAYMENT_TYPE = {
  ESCROW_FUND: 'escrow_fund',
  MILESTONE_RELEASE: 'milestone_release',
  REFUND: 'refund',
};

// User availability
export const AVAILABILITY = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  UNAVAILABLE: 'unavailable',
};

// Project categories
export const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'Content Writing',
  'Digital Marketing',
  'Video Production',
  'Game Development',
  'Blockchain',
  'Other',
];
