import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { getSiteSettings } from "@/services/contentService";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing photography services, delivery, and image rights with ADU99 Photography.",
};

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24 space-y-12">
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Legal Terms
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-medium">
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-400">
            ADU99 Photography • Greater Banjul Area, The Gambia
          </p>
        </div>

        <div className="bg-[#121214] border border-zinc-800 p-8 sm:p-12 rounded-sm space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">1. Scope of Photographic Services</h2>
            <p>
              {settings.termsText}
            </p>
            <p>
              ADU99 Photography agrees to provide photographic services according to the package or custom quote confirmed in your booking schedule. Additional shoot hours, participants, or specialized post-production are subject to extra agreed fees.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">2. Image Delivery & Archival Access</h2>
            <p>
              Edited images are delivered digitally via high-resolution private web gallery links. Standard portrait turnaround is five (5) business days. Wedding and corporate coverage turnaround is two to three weeks. Digital download galleries remain active for a minimum of 180 days from initial delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">3. Copyright & Usage Rights</h2>
            <p>
              ADU99 Photography retains copyright over all photographs created in accordance with applicable copyright laws. Clients receive a personal, perpetual, non-commercial print and digital usage license to share, print, and display the photographs for personal enjoyment. Commercial licensing must be arranged via explicit agreement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">4. Client Conduct and Punctuality</h2>
            <p>
              Clients are requested to arrive at the agreed studio or on-location venue at the scheduled start time. Arrival delays exceeding 30 minutes may cut into allocated session shooting time.
            </p>
          </section>
        </div>
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
