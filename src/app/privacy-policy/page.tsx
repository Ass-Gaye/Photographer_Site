import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { getSiteSettings } from "@/services/contentService";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Notice",
  description: "Privacy and personal data notice regarding client photographs and booking information.",
};

export default async function PrivacyPolicyPage() {
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
            Data & Image Rights
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-medium">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-400">
            ADU99 Photography • Confidentiality & Client Dignity
          </p>
        </div>

        <div className="bg-[#121214] border border-zinc-800 p-8 sm:p-12 rounded-sm space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">1. Client Privacy Commitment</h2>
            <p>
              {settings.privacyText}
            </p>
            <p>
              We collect only the essential details necessary to coordinate your booking session, communicate scheduling updates, and deliver high-resolution digital image galleries.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">2. Information Collected</h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-2">
              <li>Contact details: Name, telephone/WhatsApp number, and email address.</li>
              <li>Session specifications: Date, duration, participant numbers, and venue address.</li>
              <li>Payment records: Verification references and amounts paid (we never collect or store raw payment card data).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">3. Portfolio Publication & Consent</h2>
            <p>
              We honor every client&apos;s personal preference. If you require private session confidentiality (e.g. for private family portraits or exclusive private events), notify our studio in advance, and your images will not be published in the public portfolio or marketing materials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-serif text-white font-medium">4. Contact Regarding Data</h2>
            <p>
              For any questions regarding your stored booking records or private digital gallery access, contact us at{" "}
              <a href={`mailto:${settings.email}`} className="text-editorial-gold hover:underline">
                {settings.email}
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
