import type { Metadata } from "next";
import { ApplicationPageClient } from "./ApplicationPageClient";

export const metadata: Metadata = {
  title: "Application",
};

export default function ApplicationPage() {
  return <ApplicationPageClient />;
}
