import type { Metadata } from "next";
import { StudentShell } from "@/components/layout/StudentShell";
import { PaymentClient } from "./PaymentClient";

export const metadata: Metadata = {
  title: "Payment Status",
};

export default function PaymentPage() {
  return (
    <StudentShell
      title="Payment Status"
      description="Check your scholarship allocation amount and payment disbursement status."
    >
      <PaymentClient />
    </StudentShell>
  );
}
