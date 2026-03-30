import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.enum(['recruiter', 'projectManager', 'freelancer', 'agency']))
    .min(1, 'At least one role is required')
    .default(['freelancer']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
