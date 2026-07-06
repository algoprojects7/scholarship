import type { Metadata } from "next";
import { ProfileClient } from "./ProfileClient";
import { StudentShell } from "@/components/layout/StudentShell";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <StudentShell
      title="Profile"
      description="Manage your profile photo, password, and account settings."
    >
      <ProfileClient />
    </StudentShell>
  );
}
