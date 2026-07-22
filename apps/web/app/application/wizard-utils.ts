import type { Application, UpdateApplicationPayload } from "@/lib/applications";
import type { ApplicationFormValues } from "./schemas";

export const WIZARD_STEPS = [
  { id: 1, label: "Personal", description: "Personal & caste" },
  { id: 2, label: "Educational", description: "Course & institute" },
  { id: 3, label: "Contact", description: "Student, guardian & address" },
  { id: 4, label: "Bank", description: "Account & IFSC" },
  { id: 5, label: "Fee", description: "Payment type" },
  { id: 6, label: "Year-wise Fees", description: "2022–2026" },
  { id: 7, label: "Family", description: "Members & finances" },
  { id: 8, label: "Documents", description: "Upload 12 documents" },
  { id: 9, label: "Review", description: "Submit application" },
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
  7: ["familyDetails"],
  8: [],
  9: [],
};

export function buildDefaultFormValues(
  application: Application,
  profile?: { fullName: string; countryCode: string; mobile: string; email?: string; gender?: string },
): ApplicationFormValues {
  const feePaymentsMap = new Map(
    (application.feePayments ?? []).map((payment) => [
      payment.year,
      Number(payment.amountPaid),
    ]),
  );

  const contactData = application.contactAddress as any;
  const personalData = application.personalDetails as any;
  const eduData = application.educationalDetails as any;
  const bankData = application.bankDetails as any;
  const familyData = application.familyDetails as any;

  return {
    personalDetails: {
      studentName: personalData?.studentName ?? profile?.fullName ?? "",
      gender: personalData?.gender ?? (profile?.gender as any) ?? "MALE",
      fatherName: personalData?.fatherName ?? "",
      fatherProfession: personalData?.fatherProfession ?? "",
      motherName: personalData?.motherName ?? "",
      motherProfession: personalData?.motherProfession ?? "",
      religion: personalData?.religion ?? "",
      caste: personalData?.caste ?? "GEN",
    },
    educationalDetails: {
      courseName: eduData?.courseName ?? "",
      duration: eduData?.duration ?? "4 year",
      batch: eduData?.batch ?? "2026-27",
      rollNumber: eduData?.rollNumber ?? "",
      currentSemester: eduData?.currentSemester ?? "",
      instituteNameWithAddress:
        eduData?.instituteNameWithAddress ??
        eduData?.institutionName ??
        "Gauhati Medical College, Guwahati, Assam",
      dateOfCourseCompletion: eduData?.dateOfCourseCompletion ?? "",
      residenceType: eduData?.residenceType ?? "DAY_SCHOLAR",
    },
    contactAddress: {
      student: {
        countryCode: contactData?.student?.countryCode ?? "+91",
        mobile: contactData?.student?.mobile ?? contactData?.mobile ?? profile?.mobile ?? "",
        email: contactData?.student?.email || profile?.email || "",
        whatsapp: contactData?.student?.whatsapp ?? "",
      },
      guardian: {
        countryCode: contactData?.guardian?.countryCode ?? "+91",
        mobile: contactData?.guardian?.mobile ?? "",
      },
      address: {
        villageTown: contactData?.address?.villageTown ?? contactData?.village ?? "",
        po: contactData?.address?.po ?? contactData?.po ?? "",
        district: contactData?.address?.district ?? contactData?.district ?? "",
        pin: contactData?.address?.pin ?? contactData?.pin ?? "",
        state: contactData?.address?.state ?? contactData?.state ?? "Assam",
      },
    },
    bankDetails: {
      accountHolder: bankData?.accountHolder ?? "",
      accountNumber: bankData?.accountNumber ?? "",
      bankName: bankData?.bankName ?? "",
      branchName: bankData?.branchName ?? "",
      ifscCode: bankData?.ifscCode ?? "",
    },
    feeDetails: {
      paymentType: (application.feeDetails?.paymentType ??
        "YEARLY") as ApplicationFormValues["feeDetails"]["paymentType"],
    },
    feePayments: [2022, 2023, 2024, 2025, 2026].map((year) => ({
      year,
      amountPaid: feePaymentsMap.get(year) ?? 0,
    })),
    familyDetails: {
      members: familyData?.members ?? [
        {
          name: "",
          gender: "MALE",
          relation: "Father",
          qualification: "",
          occupation: "",
        },
      ],
      familyMonthlyIncome: familyData?.familyMonthlyIncome ?? 0,
      familyMonthlyExpense: familyData?.familyMonthlyExpense ?? 0,
    },
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
      accountHolder: values.bankDetails.accountHolder.toUpperCase(),
      ifscCode: values.bankDetails.ifscCode.toUpperCase(),
    },
    feeDetails: {
      paymentType: values.feeDetails.paymentType,
    },
    feePayments: values.feePayments,
    familyDetails: values.familyDetails,
  };
}
