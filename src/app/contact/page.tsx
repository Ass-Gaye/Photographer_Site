import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { ContactForm } from "@/components/contact/ContactForm";
import { getSiteSettings, getFAQs } from "@/services/contentService";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Contact & Studio Inquiries",
  description: "Get in touch with ADU99 Photography in Banjul, The Gambia via email, phone, or direct WhatsApp.",
};

export const revalidate = 60;

export default async function ContactPage() {
  const [settings, faqs] = await Promise.all([
    getSiteSettings(),
    getFAQs(),
  ]);

  const whatsappHref = buildWhatsAppLink(
    settings.whatsappNumber,
    "Hello ADU99 Photography, I am reaching out to inquire about photography bookings."
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24 space-y-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-medium">
            Contact & Studio Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            Have a project in mind, need a tailored quote, or want to check date availability?
            Reach out via form or start a direct conversation on WhatsApp.
          </p>
        </div>

        {/* 2-Column Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#121214] border border-zinc-800 p-8 rounded-sm space-y-6">
              <h3 className="font-serif text-2xl text-white">Studio Details</h3>

              <ul className="space-y-4 text-xs text-zinc-300">
                <li className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-editorial-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">Location</span>
                    <span>{settings.addressOrArea}</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-editorial-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">Telephone</span>
                    <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                      {settings.phone}
                    </a>
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-editorial-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">Email</span>
                    <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                      {settings.email}
                    </a>
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-editorial-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">Hours</span>
                    <span>{settings.workingHours}</span>
                  </div>
                </li>
              </ul>

              <div className="pt-4 border-t border-zinc-800/80">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-600 text-white p-3.5 rounded-sm text-xs font-semibold tracking-wide transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start WhatsApp Conversation</span>
                </a>
              </div>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800/80 rounded-sm space-y-2 text-xs">
              <h4 className="font-serif text-sm text-white">Looking for Immediate Date Booking?</h4>
              <p className="text-zinc-400">
                You can directly check available dates on our interactive booking calendar without waiting for an email reply.
              </p>
              <Link href="/book" className="text-editorial-gold hover:underline inline-flex items-center pt-2 font-medium">
                <span>Go to Booking Calendar</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 bg-[#121214] border border-zinc-800 p-8 sm:p-10 rounded-sm space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
                Send a Message
              </span>
              <h3 className="font-serif text-2xl text-white mt-1">Inquiry Form</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Fill out the form below and we will get back to you shortly.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>

        {/* Quick FAQ Snippet */}
        {faqs.length > 0 && (
          <div className="pt-12 border-t border-zinc-900 space-y-8">
            <div className="text-center space-y-2">
              <h3 className="font-serif text-2xl text-white">Common Inquiries</h3>
              <p className="text-xs text-zinc-400">
                Have quick questions regarding deposits or delivery times?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faqs.slice(0, 4).map((f) => (
                <div key={f.id} className="p-5 bg-[#121214] border border-zinc-800 rounded-sm space-y-2 text-xs">
                  <h4 className="font-medium text-white">{f.question}</h4>
                  <p className="text-zinc-400 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link href="/faq" className="text-xs text-editorial-gold hover:underline uppercase tracking-wider">
                View All Frequently Asked Questions &rarr;
              </Link>
            </div>
          </div>
        )}
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
