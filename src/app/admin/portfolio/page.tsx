import React from "react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PortfolioManager } from "@/components/admin/PortfolioManager";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  await requireAdmin();

  const [projects, categories] = await Promise.all([
    prisma.portfolioProject.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.portfolioCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
          Editorial Gallery
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium">
          Portfolio & Visual Archives
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Curate showcased client stories, featured cover photographs, locations, and gallery publications.
        </p>
      </div>

      <PortfolioManager initialProjects={projects} categories={categories} />
    </div>
  );
}
