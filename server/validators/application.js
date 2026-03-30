import { z } from 'zod';

export const createApplicationSchema = z.object({
  coverLetter: z.string().min(10).max(5000).trim(),
  proposedBudget: z.number().min(0),
  proposedTimeline: z.string().trim().optional(),
  agency: z.string().optional(),
});

export const applicationStatusSchema = z.object({
  status: z.enum(['shortlisted', 'invited', 'accepted', 'rejected', 'withdrawn']),
});
