import type { Metadata } from "next";

import { AuditLogsClient } from "./AuditLogsClient";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default function AuditLogsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="admin-page-title">Audit Logs</h2>
        <p className="admin-page-subtitle mt-0.5">
          Track admin actions across the scholarship system
        </p>
      </div>

      <AuditLogsClient />
    </div>
  );
}
