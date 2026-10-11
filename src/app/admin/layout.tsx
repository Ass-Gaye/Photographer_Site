import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin Dashboard | ADU99 Photography",
  description: "Administrative console for managing bookings, availability, portfolio, and settings.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If user is not authenticated, let the login page render if path is /admin/login
  // Otherwise, protect the route and redirect to /admin/login
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col md:flex-row font-sans">
      <AdminNav user={user} />
      <main className="flex-1 min-w-0 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
