"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { HeroGradientFallback } from "./HeroScene";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <HeroGradientFallback />,
});

interface HeroSectionProps {
  children: ReactNode;
}

export function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="landing-hero relative isolate min-h-0 overflow-x-hidden pb-4 pt-4 sm:pb-6 sm:pt-5 lg:pb-8 lg:pt-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <HeroScene />
        <div className="landing-aurora absolute inset-0 opacity-35" />
        <div className="landing-hero-glow absolute inset-0" />
        <div className="landing-hero-waves absolute inset-0 opacity-80" />
        <div className="landing-grid absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_75%_40%,transparent_0%,#f8fafc_68%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8fafc]/97 via-[#f8fafc]/82 to-[#f8fafc]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-[#f8fafc]/90" />
      </div>
      <div className="relative z-10 flex min-h-0 w-full max-w-full flex-col justify-center overflow-x-hidden">
        {children}
      </div>
    </section>
  );
}
