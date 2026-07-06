import type { Metadata } from "next";



import { ReportsClient } from "./ReportsClient";



export const metadata: Metadata = {

  title: "Reports",

};



export default function ReportsPage() {

  return (

    <div className="space-y-4">

      <div>

        <h2 className="admin-page-title">Reports</h2>

        <p className="admin-page-subtitle mt-0.5">

          Export PDF and Excel reports with shared filters

        </p>

      </div>



      <ReportsClient />

    </div>

  );

}

