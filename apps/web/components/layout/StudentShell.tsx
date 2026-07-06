import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageUpButton } from "@/components/layout/PageUpButton";

interface StudentShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function StudentShell({
  title,
  description,
  children,
}: StudentShellProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar variant="student" />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="page-container min-w-0 py-10 sm:py-14">
          <div className="mb-8 min-w-0">
            <h1 className="break-words text-2xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </main>
      <Footer />
      <PageUpButton />
    </div>
  );
}
