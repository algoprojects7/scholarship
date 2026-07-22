import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 py-10">
      <div className="w-full max-w-xl sm:max-w-2xl overflow-hidden rounded-lg border border-slate-700/60 bg-admin-surface shadow-2xl shadow-black/30">
        <div className="border-b border-admin-border bg-[#0F172A] px-8 py-6">
          <p className="admin-kpi-label mb-2 text-slate-400">
            Scholarship Management
          </p>
          <h1 className="text-xl font-semibold text-white">Admin Portal</h1>
          <p className="mt-1 text-xs text-slate-400">
            Authorized personnel only — secure sign-in required
          </p>
        </div>

        <div className="p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
