import type { Application, UpdateApplicationPayload } from "@/lib/applications";
import type { ApplicationFormValues } from "./schemas";

export const WIZARD_STEPS = [
  { id: 1, label: "Personal", description: "Family & religion" },
  { id: 2, label: "Educational", description: "Course details" },
  { id: 3, label: "Contact", description: "Address & mobile" },
  { id: 4, label: "Bank", description: "Account details" },
  { id: 5, label: "Fee", description: "Payment type" },
  { id: 6, label: "Year-wise Fees", description: "2022–2026" },
  { id: 7, label: "Documents", description: "Upload files" },
  { id: 8, label: "Review", description: "Submit application" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export const STEP_FIELD_GROUPS: Record<
  WizardStepId,
  (keyof ApplicationFormValues)[]
> = {
  1: ["personalDetails"],
  2: ["educationalDetails"],
  3: ["contactAddress"],
  4: ["bankDetails"],
  5: ["feeDetails"],
  6: ["feePayments"],
  7: [],
  8: [],
};

export function buildDefaultFormValues(
  application: Application,
  profile?: { fullName: string; countryCode: string; mobile: string },
): ApplicationFormValues {
  const feePaymentsMap = new Map(
    (application.feePayments ?? []).map((payment) => [
      payment.year,
      Number(payment.amountPaid),
    ]),
  );

  return {
    personalDetails: {
      studentName:
        application.personalDetails?.studentName ?? profile?.fullName ?? "",
      fatherName: application.personalDetails?.fatherName ?? "",
      fatherProfession: application.personalDetails?.fatherProfession ?? "",
      motherName: application.personalDetails?.motherName ?? "",
      motherProfession: application.personalDetails?.motherProfession ?? "",
      religion: application.personalDetails?.religion ?? "",
    },
    educationalDetails: {
      readingYear: application.educationalDetails?.readingYear ?? "",
      institutionName: application.educationalDetails?.institutionName ?? "",
      courseName: (application.educationalDetails?.courseName ??
        "") as ApplicationFormValues["educationalDetails"]["courseName"],
      batch: application.educationalDetails?.batch ?? "",
    },
    contactAddress: {
      countryCode: "+91",
      mobile:
        application.contactAddress?.mobile ?? profile?.mobile ?? "",
      village: application.contactAddress?.village ?? "",
      po: application.contactAddress?.po ?? "",
      district: application.contactAddress?.district ?? "",
      pin: application.contactAddress?.pin ?? "",
      state: application.contactAddress?.state ?? "",
    },
    bankDetails: {
      accountHolder: application.bankDetails?.accountHolder ?? "",
      accountNumber: application.bankDetails?.accountNumber ?? "",
      bankName: application.bankDetails?.bankName ?? "",
      branchName: application.bankDetails?.branchName ?? "",
      ifscCode: application.bankDetails?.ifscCode ?? "",
    },
    feeDetails: {
      paymentType: (application.feeDetails?.paymentType ??
        "") as ApplicationFormValues["feeDetails"]["paymentType"],
    },
    feePayments: [2022, 2023, 2024, 2025, 2026].map((year) => ({
      year,
      amountPaid: feePaymentsMap.get(year) ?? 0,
    })),
  };
}

export function formValuesToPayload(
  values: ApplicationFormValues,
): UpdateApplicationPayload {
  return {
    personalDetails: values.personalDetails,
    educationalDetails: values.educationalDetails,
    contactAddress: values.contactAddress,
    bankDetails: {
      ...values.bankDetails,
      ifscCode: values.bankDetails.ifscCode.toUpperCase(),
    },
    feeDetails: {
      paymentType: values.feeDetails.paymentType,
    },
    feePayments: values.feePayments,
  };
}
