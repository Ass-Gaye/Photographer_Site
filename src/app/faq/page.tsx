import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { Button } from "@/components/ui/Button";
import { getFAQs, getSiteSettings } from "@/services/contentService";
import { HelpCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions regarding booking, deposits, delivery timelines, and copyright with ADU99 Photography.",
};

export const revalidate = 60;

export default async function FAQPage() {
  const [faqs, settings] = await Promise.all([
    getFAQs(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24 space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Client Guidance
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-medium">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Everything you need to know about preparing for your session, deposit payments in The Gambia, delivery timelines, and image usage rights.
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-6 bg-[#121214] border border-zinc-800 rounded-sm space-y-3"
            >
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-4 h-4 text-editorial-gold shrink-0 mt-0.5" />
                <h3 className="font-serif text-lg text-white font-medium">
                  {faq.question}
                </h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="p-8 bg-[#141416] border border-zinc-800 rounded-sm text-center space-y-4">
          <h3 className="text-xl font-serif text-white">Have a Specific Question?</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Our team is always delighted to assist you with custom creative requests or scheduling inquiries.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href="/contact">
              <Button variant="outline" size="md">
                <span>Contact Studio</span>
              </Button>
            </Link>
            <Link href="/book">
              <Button variant="primary" size="md">
                <span>Book a Session</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
