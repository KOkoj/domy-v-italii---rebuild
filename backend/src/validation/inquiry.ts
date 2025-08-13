import { z } from 'zod';
import { InquiryStatus } from '@prisma/client';

export const createInquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional().nullable(),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  propertyId: z.string().cuid().optional().nullable()
});

export const updateInquirySchema = z.object({
  status: z.nativeEnum(InquiryStatus)
});

export const listInquiriesSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: z.nativeEnum(InquiryStatus).optional(),
  search: z.string().optional()
});

export type CreateInquiryDto = z.infer<typeof createInquirySchema>;
export type UpdateInquiryDto = z.infer<typeof updateInquirySchema>;
export type ListInquiriesQuery = z.infer<typeof listInquiriesSchema>;
