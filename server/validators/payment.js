import { z } from 'zod';

export const createEscrowSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  amount: z.number().min(1, 'Amount must be positive'),
});

export const refundSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.number().min(1).optional(),
  reason: z.string().max(500).trim().optional(),
});
