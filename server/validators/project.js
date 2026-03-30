import { z } from 'zod';
import { CATEGORIES } from '../utils/constants.js';

export const createProjectSchema = z.object({
  title: z.string().min(5).max(200).trim(),
  description: z.string().min(20).max(10000).trim(),
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('INR'),
  }).refine(data => data.max >= data.min, {
    message: 'Max budget must be >= min budget',
  }),
  skills: z.array(z.string().trim()).min(1, 'At least one skill is required'),
  deadline: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
});

export const updateProjectSchema = z.object({
  title: z.string().min(5).max(200).trim().optional(),
  description: z.string().min(20).max(10000).trim().optional(),
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('INR'),
  }).optional(),
  skills: z.array(z.string().trim()).optional(),
  deadline: z.string().optional(),
  category: z.string().optional(),
});

export const projectStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'under_review', 'completed', 'disputed', 'cancelled']),
});
