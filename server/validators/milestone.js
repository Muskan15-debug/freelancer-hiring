import { z } from 'zod';

export const createMilestoneSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().max(5000).trim().optional(),
  amount: z.number().min(0),
  dueDate: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  amount: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const milestoneStatusSchema = z.object({
  status: z.enum(['in_progress', 'submitted', 'approved', 'revision_requested']),
  note: z.string().max(2000).trim().optional(),
});
