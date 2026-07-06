import { INDIAN_STATE_NAMES, PaymentType } from "@scholarship/shared";
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
  fatherName: nameSchema,
  fatherProfession: z.string().trim().min(2, "Required").max(100, "Too long"),
  motherName: nameSchema,
  motherProfession: z.string().trim().min(2, "Required").max(100, "Too long"),
  religion: z.string().trim().min(2, "Required").max(50, "Too long"),
});

export const educationalDetailsSchema = z.object({
  readingYear: z.string().min(1, "Select reading year"),
  institutionName: z.string().trim().min(2, "Required").max(200, "Too long"),
  courseName: z.string().trim().min(2, "Required").max(100, "Too long"),
  batch: z
    .string()
    .trim()
    .min(4, "Enter a valid batch")
    .max(20, "Too long"),
});

export const contactAddressSchema = phoneSchema.extend({
  village: z.string().trim().min(2, "Required").max(100, "Too long"),
  po: z.string().trim().min(2, "Required").max(100, "Too long"),
  district: z.string().trim().min(2, "Required").max(100, "Too long"),
  pin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "PIN must be exactly 6 digits"),
  state: z.enum(INDIAN_STATE_NAMES as [string, ...string[]], {
    errorMap: () => ({ message: "Select a state" }),
  }),
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
      "Enter a valid IFSC code (e.g. SBIN0001234)",
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

export const applicationFormSchema = z.object({
  personalDetails: personalDetailsSchema,
  educationalDetails: educationalDetailsSchema,
  contactAddress: contactAddressSchema,
  bankDetails: bankDetailsSchema,
  feeDetails: feeDetailsSchema,
  feePayments: feePaymentsSchema,
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

export const FEE_YEARS = [2022, 2023, 2024, 2025, 2026] as const;

export const READING_YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Post Graduate",
] as const;

export const PAYMENT_TYPE_OPTIONS = [
  { value: PaymentType.YEARLY, label: "Yearly" },
  { value: PaymentType.SEMESTER, label: "Semester" },
  { value: PaymentType.ONE_TIME, label: "One Time" },
] as const;

export { mobileSchema };
