"use client";

import { AdminType } from "@scholarship/shared";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { getMe } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminName, setAdminName] = useState("Admin User");
  const [adminRole, setAdminRole] = useState<"Super Admin" | "Operator">(
    "Operator",
  );

  useEffect(() => {
    void getMe()
      .then((response) => {
        const isSuper = response.user.adminType === AdminType.SUPER;
        setIsSuperAdmin(isSuper);
        setAdminRole(isSuper ? "Super Admin" : "Operator");

        const fullName = response.user.profile?.fullName?.trim();
        if (fullName) {
          setAdminName(fullName);
        }
      })
      .catch(() => {
        setIsSuperAdmin(false);
        setAdminRole("Operator");
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar isSuperAdmin={isSuperAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          title="Operations Dashboard"
          subtitle="Scholarship program overview"
          adminName={adminName}
          adminRole={adminRole}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
