import type { Metadata } from "next";

import { AdminsClient } from "./AdminsClient";

export const metadata: Metadata = {
  title: "Admins",
};

export default function AdminsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="admin-page-title">Admin Management</h2>
        <p className="admin-page-subtitle mt-0.5">
          Create and manage operator accounts (Super Admin only)
        </p>
      </div>

      <AdminsClient />
    </div>
  );
}
