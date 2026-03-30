import { z } from 'zod';

export const assignPmSchema = z.object({
  projectManagerId: z.string().min(1, 'Project manager ID is required'),
});

export const terminateContractSchema = z.object({
  reason: z.string().min(5).max(2000).trim(),
});
