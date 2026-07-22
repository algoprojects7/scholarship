import { DocumentType } from "@scholarship/shared";
import { ApiError, apiFetch, apiFetchFormData } from "./api";

export interface PersonalDetails {
  studentName: string;
  gender: string;
  fatherName: string;
  fatherProfession: string;
  motherName: string;
  motherProfession: string;
  religion: string;
  caste: string;
}

export interface EducationalDetails {
  courseName: string;
  duration: string;
  batch: string;
  rollNumber: string;
  currentSemester: string;
  instituteNameWithAddress: string;
  dateOfCourseCompletion: string;
  residenceType: string;
}

export interface ContactAddress {
  student: {
    countryCode: string;
    mobile: string;
    email: string;
    whatsapp?: string;
  };
  guardian: {
    countryCode: string;
    mobile: string;
  };
  address: {
    villageTown: string;
    po: string;
    district: string;
    pin: string;
    state: string;
  };
}

export interface FamilyMember {
  name: string;
  gender: string;
  relation: string;
  qualification: string;
  occupation: string;
}

export interface FamilyDetails {
  members: FamilyMember[];
  familyMonthlyIncome: number;
  familyMonthlyExpense: number;
}

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
}

export interface FeeDetails {
  paymentType: string;
}

export interface FeePayment {
  year: number;
  amountPaid: number;
}

export interface ApplicationDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  verificationStatus: string;
  uploadedAt: string;
}

export interface Application {
  id: string;
  status: string;
  academicYear: string;
  applicationNumber?: string | null;
  personalDetails?: PersonalDetails | null;
  educationalDetails?: EducationalDetails | null;
  contactAddress?: ContactAddress | null;
  bankDetails?: BankDetails | null;
  feeDetails?: FeeDetails | null;
  feePayments?: FeePayment[];
  familyDetails?: FamilyDetails | null;
  documents?: ApplicationDocument[];
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateApplicationPayload {
  personalDetails?: Record<string, any>;
  educationalDetails?: Record<string, any>;
  contactAddress?: Record<string, any>;
  bankDetails?: Record<string, any>;
  feeDetails?: Record<string, any>;
  feePayments?: FeePayment[];
  familyDetails?: Record<string, any>;
}

export interface SubmitApplicationResponse {
  id: string;
  status: string;
  applicationNumber: string;
  submittedAt: string;
}

const studentPortal = { auth: true, portal: "student" as const };

export function createApplication(academicYear?: string) {
  return apiFetch<Application>("/applications", {
    method: "POST",
    ...studentPortal,
    body: academicYear ? { academicYear } : {},
  });
}

export function getMyApplications() {
  return apiFetch<Application[]>("/applications/mine", {
    ...studentPortal,
  });
}

export function getApplication(id: string) {
  return apiFetch<Application>(`/applications/${id}`, {
    ...studentPortal,
  });
}

export function updateApplication(id: string, data: UpdateApplicationPayload) {
  return apiFetch<Application>(`/applications/${id}`, {
    method: "PATCH",
    ...studentPortal,
    body: data,
  });
}

export function submitApplication(id: string) {
  return apiFetch<SubmitApplicationResponse>(`/applications/${id}/submit`, {
    method: "POST",
    ...studentPortal,
    body: {},
  });
}

export function uploadDocument(
  applicationId: string,
  documentType: DocumentType,
  file: File,
) {
  return uploadDocumentWithPresign(applicationId, documentType, file).catch(
    async (error) => {
      // Fallback to direct multipart upload if presigned upload is not supported,
      // or if uploading directly to the presigned storage URL failed (e.g. due to connection/CORS issues)
      const isStorageLocal =
        error instanceof ApiError &&
        error.status === 503 &&
        error.code === "STORAGE_LOCAL";

      // A network failure or CORS failure during upload to S3 will typically throw TypeError: Failed to fetch,
      // or an ApiError with custom message.
      const isUploadFailed =
        error instanceof TypeError ||
        (error instanceof ApiError &&
          (error.status === 0 || error.message.includes("Upload to storage failed")));

      if (isStorageLocal || isUploadFailed) {
        return uploadDocumentMultipart(applicationId, documentType, file);
      }

      throw error;
    },
  );
}

interface PresignUploadResponse {
  uploadUrl: string;
  key: string;
}

async function uploadDocumentWithPresign(
  applicationId: string,
  documentType: DocumentType,
  file: File,
) {
  const presign = await apiFetch<PresignUploadResponse>(
    `/applications/${applicationId}/documents/presign`,
    {
      method: "POST",
      ...studentPortal,
      body: {
        documentType,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      },
    },
  );

  const storageResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!storageResponse.ok) {
    throw new ApiError(
      "Upload to storage failed. Check object storage CORS settings.",
      storageResponse.status,
    );
  }

  return apiFetch<ApplicationDocument>(
    `/applications/${applicationId}/documents/confirm`,
    {
      method: "POST",
      ...studentPortal,
      body: {
        documentType,
        key: presign.key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    },
  );
}

function uploadDocumentMultipart(
  applicationId: string,
  documentType: DocumentType,
  file: File,
) {
  const formData = new FormData();
  formData.append("documentType", documentType);
  formData.append("file", file);

  return apiFetchFormData<ApplicationDocument>(
    `/applications/${applicationId}/documents`,
    {
      method: "POST",
      ...studentPortal,
      body: formData,
    },
  );
}
