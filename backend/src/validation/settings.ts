import { z } from 'zod';

export const updateSettingsSchema = z.record(z.string(), z.any());

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
