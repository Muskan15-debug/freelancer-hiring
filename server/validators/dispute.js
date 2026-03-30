import { z } from 'zod';

export const createDisputeSchema = z.object({
  contract: z.string().min(1, 'Contract ID is required'),
  milestone: z.string().optional(),
  respondent: z.string().min(1, 'Respondent ID is required'),
  reason: z.string().min(5).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
});

export const disputeStatusSchema = z.object({
  status: z.enum(['under_review', 'resolved', 'escalated']),
  decision: z.string().max(5000).trim().optional(),
  message: z.string().max(2000).trim().optional(),
});
