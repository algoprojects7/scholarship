import type { Metadata } from "next";
import { StudentShell } from "@/components/layout/StudentShell";
import { ApplicationStatusClient } from "./ApplicationStatusClient";

export const metadata: Metadata = {
  title: "Application Status",
};

export default function ApplicationStatusPage() {
  return (
    <StudentShell
      title="Application Status"
      description="Track your submitted application through verification, review, and allocation."
    >
      <ApplicationStatusClient />
    </StudentShell>
  );
}
