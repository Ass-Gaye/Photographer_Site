import React from "react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InquiriesManager } from "@/components/admin/InquiriesManager";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  await requireAdmin();

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
          Customer Relations
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium">
          Studio Inquiries & Leads
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Follow up with potential clients, answer custom quote requests, and message via WhatsApp.
        </p>
      </div>

      <InquiriesManager initialInquiries={inquiries} />
    </div>
  );
}
