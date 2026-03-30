import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  milestone: z.string().optional(),
  assignee: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  milestone: z.string().optional(),
  assignee: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

export const taskStatusSchema = z.object({
  status: z.enum(['in_progress', 'completed']),
});
