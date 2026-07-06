import type { Metadata } from "next";
import { ApplicationReviewClient } from "./ApplicationReviewClient";

export const metadata: Metadata = {
  title: "Application Review",
};

type ApplicationReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationReviewPage({
  params,
}: ApplicationReviewPageProps) {
  const { id } = await params;

  return <ApplicationReviewClient applicationId={id} />;
}
