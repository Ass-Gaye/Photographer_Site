import React from "react";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/services/contentService";
import { SettingsManager } from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
          Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium">
          Website & Business Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Update studio contact information, Dalasi payment accounts, notice windows, and legal copy.
        </p>
      </div>

      <SettingsManager initialSettings={settings} />
    </div>
  );
}
