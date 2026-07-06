import { Navbar } from "@/components/layout/Navbar";
import { PageUpButton } from "@/components/layout/PageUpButton";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar variant="public" />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      <LandingFooter />
      <PageUpButton />
    </div>
  );
}