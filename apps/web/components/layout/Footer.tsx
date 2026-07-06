import { APP_NAME } from "@scholarship/shared";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="page-container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {year} {APP_NAME}. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Powered by Algoguido Technologies
        </p>
      </div>
    </footer>
  );
}
