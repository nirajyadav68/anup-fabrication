import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-xl font-bold text-white">
          ANUP <span className="text-signal-500">FABRICATION</span>
        </p>
        <p className="mt-1 text-center text-sm text-steel-400">Admin Dashboard</p>

        <div className="mt-8 rounded-lg border border-navy-700 bg-navy-900 p-6 sm:p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
