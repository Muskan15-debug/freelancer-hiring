import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  title: z.string().max(200).trim().optional(),
  bio: z.string().max(2000).trim().optional(),
  skills: z.array(z.string().trim()).optional(),
  hourlyRate: z.number().min(0).optional(),
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
  location: z.object({
    city: z.string().trim().optional(),
    country: z.string().trim().optional(),
  }).optional(),
  portfolio: z.array(z.object({
    title: z.string(),
    url: z.string().url().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  })).optional(),
});
