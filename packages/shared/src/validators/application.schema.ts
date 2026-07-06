import { z } from 'zod';
import { PaymentType } from '../enums';
import { INDIAN_STATE_NAMES } from '../constants/states';
import { countryCodeSchema, mobileSchema } from './phone.schema';

const personNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name may only contain letters and spaces');

const professionSchema = z
  .string()
  .min(1, 'Profession is required')
  .max(100, 'Profession must be at most 100 characters');

export const personalDetailsSchema = z.object({
  studentName: personNameSchema,
  fatherName: personNameSchema,
  fatherProfession: professionSchema,
  motherName: personNameSchema,
  motherProfession: professionSchema,
  religion: z
    .string()
    .min(1, 'Religion is required')
    .max(50, 'Religion must be at most 50 characters'),
});

export const educationalDetailsSchema = z.object({
  readingYear: z
    .string()
    .min(1, 'Reading year is required')
    .max(50, 'Reading year must be at most 50 characters'),
  institutionName: z
    .string()
    .min(2, 'Institution name must be at least 2 characters')
    .max(200, 'Institution name must be at most 200 characters'),
  courseName: z
    .string()
    .min(2, 'Course name must be at least 2 characters')
    .max(200, 'Course name must be at most 200 characters'),
  batch: z
    .string()
    .min(1, 'Batch is required')
    .max(50, 'Batch must be at most 50 characters'),
});

export const contactAddressSchema = z.object({
  countryCode: countryCodeSchema,
  mobile: mobileSchema,
  village: z
    .string()
    .min(2, 'Village must be at least 2 characters')
    .max(100, 'Village must be at most 100 characters'),
  po: z
    .string()
    .min(2, 'P.O. must be at least 2 characters')
    .max(100, 'P.O. must be at most 100 characters'),
  district: z
    .string()
    .min(2, 'District must be at least 2 characters')
    .max(100, 'District must be at most 100 characters'),
  pin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
  state: z.enum(INDIAN_STATE_NAMES as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a valid state' }),
  }),
});

export const bankDetailsSchema = z.object({
  accountHolder: personNameSchema,
  accountNumber: z
    .string()
    .regex(/^\d{9,18}$/, 'Account number must be 9–18 digits'),
  bankName: z
    .string()
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name must be at most 100 characters'),
  branchName: z
    .string()
    .min(2, 'Branch name must be at least 2 characters')
    .max(100, 'Branch name must be at most 100 characters'),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
});

export const feeDetailsSchema = z.object({
  paymentType: z.nativeEnum(PaymentType, {
    errorMap: () => ({ message: 'Please select a valid payment type' }),
  }),
});

const feeAmountSchema = z
  .number({ invalid_type_error: 'Amount must be a number' })
  .min(0, 'Amount must be 0 or greater');

export const yearlyFeesSchema = z.object({
  2022: feeAmountSchema,
  2023: feeAmountSchema,
  2024: feeAmountSchema,
  2025: feeAmountSchema,
  2026: feeAmountSchema,
});

export const updateApplicationSchema = z.object({
  personalDetails: personalDetailsSchema.optional(),
  educationalDetails: educationalDetailsSchema.optional(),
  contactAddress: contactAddressSchema.optional(),
  bankDetails: bankDetailsSchema.optional(),
  feeDetails: feeDetailsSchema.optional(),
  yearlyFees: yearlyFeesSchema.optional(),
});

export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type EducationalDetailsInput = z.infer<typeof educationalDetailsSchema>;
export type ContactAddressInput = z.infer<typeof contactAddressSchema>;
export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;
export type FeeDetailsInput = z.infer<typeof feeDetailsSchema>;
export type YearlyFeesInput = z.infer<typeof yearlyFeesSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
