"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

function useMotionEnabled() {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  return hydrated && !reduced;
}

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  ...props
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-64px" });
  const motionEnabled = useMotionEnabled();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={
        motionEnabled
          ? inView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 28 }
          : { opacity: 1, y: 0 }
      }
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function StaggerChildren({
  children,
  className,
  stagger = 0.08,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px" });
  const motionEnabled = useMotionEnabled();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={
        motionEnabled ? (inView ? "visible" : "hidden") : "visible"
      }
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerItemVariants}>
      {children}
    </motion.div>
  );
}

export function FloatCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const motionEnabled = useMotionEnabled();

  return (
    <motion.div
      className={className}
      initial={false}
      animate={motionEnabled ? { y: [0, -8, 0] } : { y: 0 }}
      transition={{
        duration: 5 + delay,
        repeat: motionEnabled ? Infinity : 0,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
