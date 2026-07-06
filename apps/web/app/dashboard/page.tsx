import type { Metadata } from "next";

import { StudentShell } from "@/components/layout/StudentShell";

import { DashboardClient } from "./DashboardClient";



export const metadata: Metadata = {

  title: "Dashboard",

};



export default function DashboardPage() {

  return (

    <StudentShell

      title="Dashboard"

      description="Your scholarship application overview and status timeline."

    >

      <DashboardClient />

    </StudentShell>

  );

}

