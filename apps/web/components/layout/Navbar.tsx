"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_NAME } from "@scholarship/shared";
import { isAuthenticated, logoutUser } from "@/lib/auth";

type NavbarVariant = "public" | "student";

interface NavbarProps {
  variant?: NavbarVariant;
}

interface NavLink {
  href: string;
  label: string;
}

const publicLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/login", label: "Login" },
];

const landingLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#scholarship-types", label: "Programs" },
  { href: "#how-it-works", label: "How It Works" },
];

const authenticatedPublicLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/application", label: "Application" },
  { href: "/application-status", label: "Application Status" },
  { href: "/payment", label: "Payment Status" },
  { href: "/profile", label: "Profile" },
];

const studentLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/application", label: "Application" },
  { href: "/application-status", label: "Application Status" },
  { href: "/payment", label: "Payment Status" },
  { href: "/profile", label: "Profile" },
];

function navLinkClass(isLanding: boolean, isActive: boolean) {
  if (isLanding) {
    return isActive
      ? "bg-blue-50 text-blue-700"
      : "text-slate-600 hover:bg-slate-50 hover:text-blue-700";
  }

  return isActive
    ? "bg-primary-muted text-primary"
    : "text-muted-foreground hover:bg-muted hover:text-[var(--color-foreground)]";
}

export function Navbar({ variant = "public" }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isLanding = variant === "public" && pathname === "/" && !loggedIn;

  const links =
    variant === "student"
      ? studentLinks
      : loggedIn
        ? authenticatedPublicLinks
        : isLanding
          ? landingLinks
          : publicLinks;

  const showLogout = variant === "student" || loggedIn;

  async function handleLogout() {
    setLoggingOut(true);
    setMenuOpen(false);

    try {
      await logoutUser();
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function isLinkActive(href: string) {
    if (href.startsWith("#")) {
      return false;
    }

    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        isLanding
          ? "border-b border-slate-200/80 bg-white/80 backdrop-blur-xl"
          : "border-b border-border bg-surface/80 backdrop-blur-md"
      }`}
    >
      <div className="page-container flex h-14 min-w-0 items-center justify-between gap-3 sm:h-16">
        <Link
          href={variant === "student" || loggedIn ? "/dashboard" : "/"}
          className="min-w-0 shrink-0 text-base font-bold tracking-tight text-[var(--color-foreground)] sm:text-lg"
        >
          <span className={isLanding ? "text-blue-600" : "text-primary"}>
            SMS
          </span>
          <span className="hidden sm:inline"> — {APP_NAME}</span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 lg:flex lg:gap-1.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${navLinkClass(isLanding, isLinkActive(link.href))}`}
            >
              {link.label}
            </Link>
          ))}

          {isLanding ? (
            <>
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700"
              >
                Login
              </Link>
              <Link href="/register" className="landing-btn-primary !w-auto !px-4 !py-2">
                Register
              </Link>
            </>
          ) : null}

          {showLogout ? (
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          ) : null}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className="text-lg leading-none">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${navLinkClass(isLanding, isLinkActive(link.href))}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {isLanding ? (
              <>
                <li className="pt-2">
                  <Link
                    href="/login"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="landing-btn-primary mt-1 block text-center"
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : null}

            {showLogout ? (
              <li>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut ? "Logging out…" : "Logout"}
                </button>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
