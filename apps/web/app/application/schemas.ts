import {
  Caste,
  COURSE_OPTIONS,
  Gender,
  INDIAN_STATE_NAMES,
  PaymentType,
  ResidenceType,
} from "@scholarship/shared";
import { mobileSchema, phoneSchema } from "@scholarship/shared";
import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(100, "Must be at most 100 characters")
  .regex(/^[A-Za-z\s.'-]+$/, "Only letters and spaces allowed");

export const personalDetailsSchema = z.object({
  studentName: nameSchema,
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: "Select gender" }),
  }),
  fatherName: nameSchema,
  fatherProfession: z.string().trim().min(1, "Required").max(100, "Too long"),
  motherName: nameSchema,
  motherProfession: z.string().trim().min(1, "Required").max(100, "Too long"),
  religion: z.string().trim().min(1, "Required").max(50, "Too long"),
  caste: z.nativeEnum(Caste, {
    errorMap: () => ({ message: "Select Caste" }),
  }),
});

export const DURATION_OPTIONS = [
  "1 year",
  "2 year",
  "3 year",
  "4 year",
  "5 year",
] as const;

export const educationalDetailsSchema = z.object({
  courseName: z.string().trim().min(1, "Select or enter course name"),
  duration: z.enum(DURATION_OPTIONS, {
    errorMap: () => ({ message: "Select duration" }),
  }),
  batch: z
    .string()
    .trim()
    .min(1, "Enter batch (e.g. 2026-27)")
    .max(50, "Too long"),
  rollNumber: z
    .string()
    .trim()
    .min(1, "Enter roll number")
    .max(50, "Too long"),
  currentSemester: z
    .string()
    .trim()
    .min(1, "Enter current semester")
    .max(50, "Too long"),
  instituteNameWithAddress: z
    .string()
    .trim()
    .min(2, "Enter institute name with address")
    .max(300, "Too long"),
  dateOfCourseCompletion: z
    .string()
    .trim()
    .min(1, "Select completion date"),
  residenceType: z.nativeEnum(ResidenceType, {
    errorMap: () => ({ message: "Select Hosteler or Day Scholar" }),
  }),
});

export const studentContactSchema = z.object({
  countryCode: z.string().default("+91"),
  mobile: mobileSchema,
  email: z.string().trim().email("Enter valid email"),
  whatsapp: z.string().trim().optional(),
});

export const guardianContactSchema = z.object({
  countryCode: z.string().default("+91"),
  mobile: mobileSchema,
});

export const addressSchema = z.object({
  villageTown: z.string().trim().min(2, "Required").max(100, "Too long"),
  po: z.string().trim().min(2, "Required").max(100, "Too long"),
  district: z.string().trim().min(2, "Required").max(100, "Too long"),
  pin: z.string().trim().regex(/^\d{6}$/, "PIN must be 6 digits"),
  state: z.enum(INDIAN_STATE_NAMES as [string, ...string[]], {
    errorMap: () => ({ message: "Select state" }),
  }),
});

export const contactAddressSchema = z.object({
  student: studentContactSchema,
  guardian: guardianContactSchema,
  address: addressSchema,
});

export const bankDetailsSchema = z.object({
  accountHolder: nameSchema,
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, "Account number must be 9–18 digits"),
  bankName: z.string().trim().min(2, "Required").max(100, "Too long"),
  branchName: z.string().trim().min(2, "Required").max(100, "Too long"),
  ifscCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]{4}0[A-Z0-9]{6}$/,
      "Format must be standard 11-char Indian bank IFSC Code (e.g. SBIN0001234)",
    ),
});

export const feeDetailsSchema = z.object({
  paymentType: z
    .string()
    .min(1, "Select payment type")
    .refine(
      (value): value is PaymentType =>
        Object.values(PaymentType).includes(value as PaymentType),
      "Select payment type",
    ),
});

export const feePaymentSchema = z.object({
  year: z.number().int().min(2022).max(2026),
  amountPaid: z.coerce.number().min(0, "Amount cannot be negative"),
});

export const feePaymentsSchema = z.array(feePaymentSchema).length(5);

export const familyMemberSchema = z.object({
  name: nameSchema,
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: "Select gender" }),
  }),
  relation: z.string().trim().min(1, "Required").max(50, "Too long"),
  qualification: z.string().trim().min(1, "Required").max(100, "Too long"),
  occupation: z.string().trim().min(1, "Required").max(100, "Too long"),
});

export const familyDetailsSchema = z.object({
  members: z.array(familyMemberSchema).min(1, "Add at least one family member"),
  familyMonthlyIncome: z.coerce
    .number()
    .min(0, "Income cannot be negative"),
  familyMonthlyExpense: z.coerce
    .number()
    .min(0, "Expense cannot be negative"),
});

export const applicationFormSchema = z.object({
  personalDetails: personalDetailsSchema,
  educationalDetails: educationalDetailsSchema,
  contactAddress: contactAddressSchema,
  bankDetails: bankDetailsSchema,
  feeDetails: feeDetailsSchema,
  feePayments: feePaymentsSchema,
  familyDetails: familyDetailsSchema,
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

export const FEE_YEARS = [2022, 2023, 2024, 2025, 2026] as const;

export { COURSE_OPTIONS };
