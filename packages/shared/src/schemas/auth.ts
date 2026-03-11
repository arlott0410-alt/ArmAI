import { z } from 'zod';
import { ROLE } from '../constants.js';

const roleEnum = z.enum([ROLE.SUPER_ADMIN, ROLE.MERCHANT_ADMIN]);

export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  full_name: z.string().nullable(),
  role: roleEnum,
  created_at: z.string(),
  updated_at: z.string(),
});

export const sessionPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email().optional(),
  role: roleEnum.optional(),
  merchant_ids: z.array(z.string().uuid()).optional(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;
