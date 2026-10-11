import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getServices, getSiteSettings } from "@/services/contentService";

export const metadata = {
  title: "Book a Photography Session",
  description: "Select your preferred photography package, date, and time slot with ADU99 Photography in The Gambia.",
};

export const revalidate = 0; // Dynamic availability

interface BookPageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const { service } = await searchParams;
  const [services, settings] = await Promise.all([
    getServices(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Online Scheduling
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-medium">
            Book Your Session
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            Choose your service, select an open date on our studio calendar, and customize your package.
            Confirmed sessions are protected against double-booking.
          </p>
        </div>

        {/* Wizard */}
        <BookingWizard
          services={services}
          whatsappNumber={settings.whatsappNumber}
          initialServiceSlug={service}
        />
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
