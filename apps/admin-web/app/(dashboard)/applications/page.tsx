import type { Metadata } from "next";

import { ApplicationsClient } from "./ApplicationsClient";

export const metadata: Metadata = {
  title: "Applications",
};

export default function ApplicationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="admin-page-title">Applications</h2>
        <p className="admin-page-subtitle mt-0.5">
          Review, verify, approve, or reject student submissions
        </p>
      </div>

      <ApplicationsClient />
    </div>
  );
}
