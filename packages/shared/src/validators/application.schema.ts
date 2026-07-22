import { z } from 'zod';
import { Caste, Gender, PaymentType, ResidenceType } from '../enums';
import { INDIAN_STATE_NAMES } from '../constants/states';
import { countryCodeSchema, mobileSchema } from './phone.schema';

const personNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .regex(/^[a-zA-Z\s.]+$/, 'Name may only contain letters, dots, and spaces');

const professionSchema = z
  .string()
  .min(1, 'Profession is required')
  .max(100, 'Profession must be at most 100 characters');

export const CASTE_OPTIONS = [
  { value: 'GEN', label: 'Gen' },
  { value: 'SC', label: 'SC' },
  { value: 'ST_P', label: 'ST (P)' },
  { value: 'ST_H', label: 'ST (H)' },
  { value: 'OBC', label: 'OBC' },
  { value: 'MOBC', label: 'MOBC' },
] as const;

export const DURATION_OPTIONS = [
  '1 year',
  '2 year',
  '3 year',
  '4 year',
  '5 year',
] as const;

export const personalDetailsSchema = z.object({
  studentName: personNameSchema,
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  fatherName: personNameSchema,
  fatherProfession: professionSchema,
  motherName: personNameSchema,
  motherProfession: professionSchema,
  religion: z
    .string()
    .min(1, 'Religion is required')
    .max(50, 'Religion must be at most 50 characters'),
  caste: z.nativeEnum(Caste, {
    errorMap: () => ({ message: 'Please select a valid Caste' }),
  }),
});

export const COURSE_OPTIONS = [
  'HS (Arts)',
  'HS (Sc)',
  'HS (Comm)',
  'BTech',
  'BA',
  'BBA',
  'BCA',
  'BCom',
  'BSc',
  'BDS',
  'BHMS',
  'BAMS',
  'LLB',
  'BEd',
  'MTech',
  'MA',
  'MBA',
  'MCA',
  'MCom',
  'MSc',
  'MDS',
  'MBBS',
  'PhD',
] as const;

export const educationalDetailsSchema = z.object({
  courseName: z.string().min(1, 'Course name is required'),
  duration: z.enum(DURATION_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid duration' }),
  }),
  batch: z
    .string()
    .min(1, 'Batch is required')
    .max(50, 'Batch must be at most 50 characters'),
  rollNumber: z
    .string()
    .min(1, 'Roll number is required')
    .max(50, 'Roll number must be at most 50 characters'),
  currentSemester: z
    .string()
    .min(1, 'Current semester is required')
    .max(50, 'Current semester must be at most 50 characters'),
  instituteNameWithAddress: z
    .string()
    .min(2, 'Institute name with address must be at least 2 characters')
    .max(300, 'Institute name with address must be at most 300 characters'),
  dateOfCourseCompletion: z
    .string()
    .min(1, 'Date of course completion is required'),
  residenceType: z.nativeEnum(ResidenceType, {
    errorMap: () => ({ message: 'Please select Hosteler or Day Scholar' }),
  }),
});

export const studentContactSchema = z.object({
  countryCode: countryCodeSchema,
  mobile: mobileSchema,
  email: z.string().email('Invalid email address'),
  whatsapp: z
    .object({
      countryCode: countryCodeSchema,
      mobile: mobileSchema,
    })
    .optional()
    .or(z.literal(null)),
});

export const guardianContactSchema = z.object({
  countryCode: countryCodeSchema,
  mobile: mobileSchema,
});

export const addressSchema = z.object({
  villageTown: z
    .string()
    .min(2, 'Village/Town must be at least 2 characters')
    .max(100, 'Village/Town must be at most 100 characters'),
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

export const contactAddressSchema = z.object({
  student: studentContactSchema,
  guardian: guardianContactSchema,
  address: addressSchema,
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
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'IFSC code must follow standard Indian bank format (e.g. SBIN0001234)'),
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

export const familyMemberSchema = z.object({
  name: personNameSchema,
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  relation: z.string().min(1, 'Relation is required').max(50, 'Relation must be at most 50 characters'),
  qualification: z.string().min(1, 'Qualification is required').max(100, 'Qualification must be at most 100 characters'),
  occupation: z.string().min(1, 'Occupation is required').max(100, 'Occupation must be at most 100 characters'),
});

export const familyDetailsSchema = z.object({
  members: z.array(familyMemberSchema).min(1, 'At least one family member must be added'),
  familyMonthlyIncome: z
    .number({ invalid_type_error: 'Monthly income must be a number' })
    .min(0, 'Income must be 0 or greater'),
  familyMonthlyExpense: z
    .number({ invalid_type_error: 'Monthly expense must be a number' })
    .min(0, 'Expense must be 0 or greater'),
});

export const updateApplicationSchema = z.object({
  personalDetails: personalDetailsSchema.optional(),
  educationalDetails: educationalDetailsSchema.optional(),
  contactAddress: contactAddressSchema.optional(),
  bankDetails: bankDetailsSchema.optional(),
  feeDetails: feeDetailsSchema.optional(),
  yearlyFees: yearlyFeesSchema.optional(),
  familyDetails: familyDetailsSchema.optional(),
});

export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type EducationalDetailsInput = z.infer<typeof educationalDetailsSchema>;
export type ContactAddressInput = z.infer<typeof contactAddressSchema>;
export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;
export type FeeDetailsInput = z.infer<typeof feeDetailsSchema>;
export type YearlyFeesInput = z.infer<typeof yearlyFeesSchema>;
export type FamilyMemberInput = z.infer<typeof familyMemberSchema>;
export type FamilyDetailsInput = z.infer<typeof familyDetailsSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
