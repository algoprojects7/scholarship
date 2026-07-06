import { apiFetch, apiFetchFormData } from "./api";

export interface StudentProfile {
  fullName: string;
  email: string;
  gender: string;
  countryCode: string;
  mobile: string;
  hasAvatar: boolean;
}

export interface UploadAvatarResponse {
  message: string;
  hasAvatar: boolean;
}

export function fetchStudentProfile() {
  return apiFetch<StudentProfile>("/student/profile", {
    method: "GET",
    auth: true,
    portal: "student",
  });
}

export function uploadProfileAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetchFormData<UploadAvatarResponse>("/student/profile/avatar", {
    method: "POST",
    auth: true,
    portal: "student",
    body: formData,
    credentials: "include",
  });
}

export async function fetchProfileAvatarBlob(): Promise<Blob> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const { getAccessToken } = await import("./auth");
  const token = getAccessToken();

  const response = await fetch(`${API_URL}/student/profile/avatar`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to load profile photo");
  }

  return response.blob();
}
