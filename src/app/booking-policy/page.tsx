import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { getSiteSettings } from "@/services/contentService";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Booking & Cancellation Policy",
  description: "Official booking, deposit settlement, and rescheduling terms for ADU99 Photography.",
};

export default async function BookingPolicyPage() {
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
            Client Policies
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-medium">
            Booking, Deposit & Rescheduling Policy
          </h1>
          <p className="text-xs text-zinc-400">
            Last updated: October 2026 • ADU99 Photography, The Gambia
          </p>
        </div>

        <div className="bg-[#121214] border border-zinc-800 p-8 sm:p-12 rounded-sm space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">1. Reservation & Deposit Requirement</h2>
            <p>
              To secure and hold a specific date and time on the studio calendar, a deposit equal to{" "}
              <strong className="text-white">{settings.depositPercentageDefault}% of the total session fee</strong> is required following studio confirmation.
            </p>
            <p>
              Until a deposit is verified and marked as paid, the time slot remains open on the calendar and may be released to other prospective clients.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">2. Rescheduling Policy</h2>
            <p>
              {settings.cancellationPolicyText}
            </p>
            <p>
              Rescheduling requests must be communicated via the client booking portal, email, or official WhatsApp. Sessions may be rescheduled up to two (2) times without penalty when proper notice is provided.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">3. Cancellations and No-Shows</h2>
            <p>
              Cancellations made with less than 72 hours advance notice, or failure to arrive at the agreed session venue without prior communication, will result in forfeiture of the booking deposit to compensate for reserved studio time and staff allocation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">4. Accepted Payment Methods</h2>
            <p>
              We accommodate local Gambian payment workflows including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-2">
              <li>Wave mobile money transfer</li>
              <li>QMoney mobile transfer</li>
              <li>Direct bank transfer to Ecobank Gambia Ltd</li>
              <li>Physical in-studio cash settlement prior to shoot initiation</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">5. Weather & Force Majeure (Outdoor Shoots)</h2>
            <p>
              In the event of severe weather or adverse environmental conditions affecting outdoor sessions, ADU99 Photography and the client will mutually agree on an alternative indoor arrangement or reschedule without penalty.
            </p>
          </section>
        </div>
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
