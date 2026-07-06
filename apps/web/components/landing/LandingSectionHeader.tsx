import type { ReactNode } from "react";
import { FadeIn } from "./motion";

interface LandingSectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: LandingSectionHeaderProps) {
  const alignClass = align === "center" ? "mx-auto text-center" : "text-left";

  return (
    <FadeIn className={`max-w-3xl ${alignClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
        {eyebrow}
      </p>
      <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      ) : null}
    </FadeIn>
  );
}
