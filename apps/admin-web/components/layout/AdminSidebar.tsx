"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";

type AdminSidebarProps = {
  isSuperAdmin?: boolean;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ isSuperAdmin = false }: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.superOnly || isSuperAdmin,
  );

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-admin-border bg-admin-primary">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-2xs font-medium uppercase tracking-widest text-white/50">
          Scholarship
        </p>
        <p className="mt-0.5 text-sm font-semibold text-white">Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-0.5 p-3" aria-label="Admin navigation">
        {visibleItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                active
                  ? "bg-admin-accent text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className={active ? "text-white" : "text-white/60"}>
                {item.icon}
              </span>
              {item.label}
              {item.superOnly && (
                <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/60">
                  Super
                </span>
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
