"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Layers,
  Image as ImageIcon,
  Users,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Camera,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface AdminNavProps {
  user: SessionUser | null;
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // If on the login page, don't show the sidebar
  if (pathname === "/admin/login") {
    return null;
  }

  // If not logged in, redirect to login
  if (!user && typeof window !== "undefined") {
    router.replace("/admin/login");
    return null;
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
    { label: "Availability", href: "/admin/availability", icon: Clock },
    { label: "Services & Packages", href: "/admin/services", icon: Layers },
    { label: "Portfolio", href: "/admin/portfolio", icon: ImageIcon },
    { label: "Clients", href: "/admin/clients", icon: Users },
    { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { label: "Payments & Ledger", href: "/admin/payments", icon: CreditCard },
    { label: "Website Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#111113] border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white">
          <Camera className="w-5 h-5 text-editorial-gold" />
          <span className="font-serif font-medium">ADU99 Admin</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-300 hover:text-white"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#111113] border-r border-zinc-800 flex flex-col justify-between transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-700 flex items-center justify-center text-editorial-gold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif tracking-wider text-base font-medium text-white block">
                ADU99 STUDIO
              </span>
              <span className="text-[9px] uppercase tracking-ultra text-zinc-500">
                Admin Console
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800/90 text-editorial-gold border-l-2 border-editorial-gold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="p-6 border-t border-zinc-800/80 space-y-4">
          {user && (
            <div className="text-xs">
              <span className="block font-medium text-white truncate">{user.name}</span>
              <span className="block text-[10px] text-zinc-500 font-mono truncate">{user.email}</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 pt-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
