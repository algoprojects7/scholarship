import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PORTALS } from "@scholarship/shared";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Admin Portal | Scholarship Management",
    template: "%s | Scholarship Admin",
  },
  description: "Scholarship Management System — Admin Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const portal = process.env.NEXT_PUBLIC_PORTAL ?? PORTALS.ADMIN;

  return (
    <html lang="en" className={inter.variable}>
      <body data-portal={portal}>{children}</body>
    </html>
  );
}
