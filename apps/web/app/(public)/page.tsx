import type { Metadata } from "next";
import { APP_NAME } from "@scholarship/shared";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingScholarshipTypes } from "@/components/landing/LandingScholarshipTypes";
import { HeroSection } from "@/components/three/HeroSection";

export const metadata: Metadata = {
  title: `${APP_NAME} — Student Scholarship Portal`,
  description:
    "Official portal for organization students to register, apply for scholarships, upload documents, and track verification and allocation.",
  openGraph: {
    title: `${APP_NAME} — Student Scholarship Portal`,
    description:
      "Register, apply, upload documents, and track your scholarship from verification through allocation.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-w-0 overflow-x-hidden">
      <HeroSection>
        <LandingHero />
      </HeroSection>

      <LandingFeatures />
      <LandingScholarshipTypes />
      <LandingHowItWorks />
      <LandingCTA />
    </div>
  );
}
