import { z } from 'zod';
import { PropertyStatus } from '@prisma/client';

export const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  priceEuro: z.number().positive('Price must be positive'),
  type: z.string().min(1, 'Property type is required'),
  status: z.nativeEnum(PropertyStatus).optional().default('ACTIVE'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  region: z.string().min(1, 'Region is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  bedrooms: z.number().int().min(0, 'Bedrooms must be non-negative'),
  bathrooms: z.number().int().min(0, 'Bathrooms must be non-negative'),
  area: z.number().int().positive('Area must be positive'),
  lotSize: z.number().int().positive().optional().nullable(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
  features: z.array(z.string()).optional().default([])
});

export const updatePropertySchema = createPropertySchema.partial();

export const listPropertiesSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  type: z.string().optional(),
  status: z.nativeEnum(PropertyStatus).optional(),
  search: z.string().optional()
});

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;
export type UpdatePropertyDto = z.infer<typeof updatePropertySchema>;
export type ListPropertiesQuery = z.infer<typeof listPropertiesSchema>;
