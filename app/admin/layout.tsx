import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware already redirects unauthenticated requests away from /admin/*
  // (except /admin/login); this is a defense-in-depth check for the layout
  // itself, since /admin/login renders its own standalone shell below.
  if (!user) {
    // If we reach here, we're on /admin/login — render children without
    // the authenticated shell.
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Authenticated in Supabase Auth but no admin profile row — not an
    // authorized admin. Sign them out rather than showing an empty shell.
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-steel-50 md:flex-row">
      <AdminSidebar />
      <div className="flex-1">
        <header className="hidden items-center justify-end border-b border-steel-100 bg-white px-6 py-3 md:flex">
          <p className="text-sm text-steel-500">
            Signed in as <span className="font-medium text-navy-900">{profile.full_name}</span>
          </p>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
