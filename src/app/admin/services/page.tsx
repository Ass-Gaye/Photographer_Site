import React from "react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ServicesManager } from "@/components/admin/ServicesManager";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await requireAdmin();

  const services = await prisma.service.findMany({
    include: {
      packages: { orderBy: { sortOrder: "asc" } },
      addOns: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
          Studio Catalog
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium">
          Services & Packages Catalog
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configure session deliverables, prices in Gambian Dalasi, outfit allowances, and calendar buffer times.
        </p>
      </div>

      <ServicesManager initialServices={services} />
    </div>
  );
}
