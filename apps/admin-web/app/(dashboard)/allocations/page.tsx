import type { Metadata } from "next";

import { AllocationsClient } from "./AllocationsClient";

export const metadata: Metadata = {
  title: "Allocations",
};

export default function AllocationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="admin-page-title">Allocations</h2>
        <p className="admin-page-subtitle mt-0.5">
          Scholarship allocations and payment tracking
        </p>
      </div>

      <AllocationsClient />
    </div>
  );
}
