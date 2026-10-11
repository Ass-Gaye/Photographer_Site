import React from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  await requireAdmin();

  const [rules, blocked] = await Promise.all([
    prisma.availabilityRule.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.blockedTime.findMany({ orderBy: { startDate: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
          Studio Schedule
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium">
          Availability & Calendar Rules
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Control standard weekly studio hours, buffer periods, and block vacation dates or holidays.
        </p>
      </div>

      <AvailabilityManager initialRules={rules} initialBlocked={blocked} />
    </div>
  );
}
