import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { getPortfolioCategories, getPortfolioProjects, getSiteSettings } from "@/services/contentService";

export const metadata = {
  title: "Portfolio & Visual Archives",
  description:
    "Explore our editorial portraits, wedding documentations, and milestone celebration archives across The Gambia.",
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const [categories, projects, settings] = await Promise.all([
    getPortfolioCategories(),
    getPortfolioProjects(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Visual Storytelling
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-medium">
            Portfolio & Archives
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            A curated collection of natural light portraiture, heartfelt matrimonial ceremonies,
            milestone honors, and creative fashion editorials captured in The Gambia.
          </p>
        </div>

        {/* Interactive Gallery */}
        <PortfolioGallery categories={categories} initialProjects={projects} />
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
