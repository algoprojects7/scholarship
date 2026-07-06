"use client";

type AdminTopbarProps = {
  title: string;
  subtitle?: string;
  /** Phase 0: defaults to Super Admin for preview */
  adminName?: string;
  adminRole?: "Super Admin" | "Operator";
};

export function AdminTopbar({
  title,
  subtitle,
  adminName = "Admin User",
  adminRole = "Super Admin",
}: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-admin-border bg-admin-surface px-6">
      <div className="min-w-0">
        <h1 className="admin-page-title truncate">{title}</h1>
        {subtitle && (
          <p className="admin-page-subtitle truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="inline-flex h-2 w-2 rounded-full bg-admin-accent" />
          <span className="text-2xs font-medium uppercase tracking-wide text-admin-muted">
            API: {process.env.NEXT_PUBLIC_API_URL ?? "not configured"}
          </span>
        </div>

        <div className="h-6 w-px bg-admin-border" aria-hidden />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-admin-primary">{adminName}</p>
            <p className="text-2xs text-admin-muted">{adminRole}</p>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-admin-primary text-xs font-semibold text-white"
            aria-hidden
          >
            {adminName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
