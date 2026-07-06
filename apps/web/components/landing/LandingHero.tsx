"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeIndianRupee,
  Check,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { FadeIn, FloatCard } from "./motion";

const highlights = [
  "AI Eligibility Check",
  "Secure Verification",
  "Real-time Tracking",
] as const;

const statCards = [
  {
    icon: BadgeIndianRupee,
    value: "₹50 Crore+",
    label: "Scholarships Awarded",
    valueClass: "text-emerald-600",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Users,
    value: "2,50,000+",
    label: "Students Registered",
    valueClass: "text-violet-600",
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    icon: ShieldCheck,
    value: "98%",
    label: "Successful Verification",
    valueClass: "text-emerald-600",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Sparkles,
    value: "AI Recommendation",
    label: "15 Scholarships Match Your Profile",
    valueClass: "text-blue-600",
    iconClass: "bg-blue-50 text-blue-600",
    compactValue: true,
  },
] as const;

export function LandingHero() {
  return (
    <div className="hero-grid page-container grid min-w-0 max-w-full gap-8 overflow-x-hidden py-8 sm:gap-10 sm:py-10 lg:grid-cols-2 lg:gap-10 lg:py-12">
      <div className="hero-copy flex min-h-0 flex-col justify-center">
        <FadeIn>
          <p className="landing-hero-badge mb-5 inline-flex max-w-full items-center rounded-full px-4 py-1.5 text-xs font-semibold sm:mb-6 sm:text-sm">
            AI-Powered Scholarship Management
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <h1 className="break-words text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] xl:text-5xl xl:leading-[1.1]">
            Empowering Students Through{" "}
            <span className="text-blue-600">Smart Scholarship Management</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.16}>
          <p className="mt-5 break-words text-base leading-7 text-slate-600 sm:mt-6 sm:text-[1.05rem] sm:leading-8">
            Discover, apply, verify, and track scholarships through one secure
            AI-powered platform. Connecting students, institutions, government
            agencies, and sponsors with complete transparency.
          </p>
        </FadeIn>

        <FadeIn delay={0.24}>
          <div className="mt-8 flex w-full min-w-0 flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link href="/register" className="landing-btn-primary">
              Apply for Scholarship
            </Link>
            <Link href="#scholarship-types" className="landing-btn-secondary">
              Explore Scholarships
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.32}>
          <ul className="mt-8 flex min-w-0 flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
            {highlights.map((label) => (
              <li
                key={label}
                className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600"
                  aria-hidden
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>

      <FadeIn delay={0.2} className="hero-visual-col flex min-h-0 min-w-0">
        <div className="hero-visual-panel flex w-full min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
          <div className="hero-image-stage relative flex min-h-[16rem] flex-1 items-center justify-center sm:min-h-[18rem] lg:min-h-0">
            <div className="relative h-full w-full max-w-[14rem] sm:max-w-[15rem] lg:max-w-none">
              <Image
                src="/images/hero-student.png"
                alt="Smiling female student holding a laptop with graduation cap and certificate"
                fill
                priority
                sizes="(max-width: 640px) 240px, (max-width: 1024px) 50vw, 360px"
                className="object-contain object-center"
              />
            </div>
          </div>

          <div className="hero-stat-stack flex w-full min-w-0 flex-col gap-2.5 sm:min-w-[13.25rem] sm:max-w-[14rem] sm:shrink-0 lg:min-w-[13.5rem] lg:max-w-[14.25rem]">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              const compactValue = "compactValue" in card && card.compactValue;
              return (
                <FloatCard key={card.label} delay={index * 0.35}>
                  <article className="hero-stat-card rounded-2xl bg-white/95 p-3 shadow-card backdrop-blur-sm">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-bold leading-snug text-slate-900 ${card.valueClass} ${
                            compactValue
                              ? "text-[0.8125rem] sm:text-[0.875rem]"
                              : "text-sm"
                          }`}
                        >
                          {card.value}
                        </p>
                        <p className="mt-1 text-[0.6875rem] leading-snug text-slate-500">
                          {card.label}
                        </p>
                      </div>
                    </div>
                  </article>
                </FloatCard>
              );
            })}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
