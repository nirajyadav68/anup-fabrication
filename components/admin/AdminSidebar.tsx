"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Wrench,
  FolderKanban,
  Images,
  FileText,
  Star,
  ShoppingCart,
  Users,
  MessageSquare,
  Settings,
  UserCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/admin/actions";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/quotes", label: "Quote Requests", icon: FileText },
  { href: "/admin/messages", label: "Contact Messages", icon: MessageSquare },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Website Settings", icon: Settings },
  { href: "/admin/profile", label: "Admin Profile", icon: UserCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = (
    <ul className="space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-steel-300 transition-colors hover:bg-navy-800 hover:text-white",
                isActive && "bg-navy-800 text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-navy-800 bg-navy-900 px-4 py-3 md:hidden">
        <p className="font-display text-lg font-bold text-white">
          ANUP <span className="text-signal-500">ADMIN</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="text-white"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav aria-label="Admin" className="border-b border-navy-800 bg-navy-900 px-4 py-3 md:hidden">
          {NavLinks}
          <form action={signOut} className="mt-2 border-t border-navy-800 pt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-steel-300 hover:bg-navy-800 hover:text-white"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sign Out
            </button>
          </form>
        </nav>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-navy-800 bg-navy-900 md:flex md:flex-col md:justify-between md:p-4">
        <div>
          <p className="px-2 font-display text-lg font-bold text-white">
            ANUP <span className="text-signal-500">ADMIN</span>
          </p>
          <nav aria-label="Admin" className="mt-6">
            {NavLinks}
          </nav>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-steel-300 hover:bg-navy-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Sign Out
          </button>
        </form>
      </aside>
    </>
  );
}
