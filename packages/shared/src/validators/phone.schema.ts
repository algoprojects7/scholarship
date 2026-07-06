import { z } from 'zod';

export const countryCodeSchema = z.literal('+91');

export const mobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Mobile must be 10 digits starting with 6–9');

export const phoneSchema = z.object({
  countryCode: countryCodeSchema,
  mobile: mobileSchema,
});

export type PhoneInput = z.infer<typeof phoneSchema>;
