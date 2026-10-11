import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles, Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { Button } from "@/components/ui/Button";
import { getServices, getSiteSettings } from "@/services/contentService";
import { resolveInstagramImage } from "@/lib/instagramImages";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Photography Services & Collections",
  description:
    "Explore our portrait, wedding, graduation, and corporate photography services in The Gambia.",
};

export const revalidate = 60;

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24 space-y-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Studio Offerings
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-medium">
            Photography Services
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            Every session is treated with individual creative care, cinematic lighting setup, and professional color grading tailored to the Gambian sunlight.
          </p>
        </div>

        {/* Services List with Asymmetric Editorial Layout */}
        <div className="space-y-24">
          {services.map((service, idx) => {
            const isReversed = idx % 2 === 1;
            return (
              <div
                key={service.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image Column */}
                <div className={`lg:col-span-6 relative aspect-[4/3] rounded-sm overflow-hidden bg-zinc-900 border border-zinc-800 ${isReversed ? "lg:order-2" : "lg:order-1"}`}>
                  {service.coverImage && (
                    <Image
                      src={resolveInstagramImage(service.coverImage, idx)}
                      alt={service.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                </div>

                {/* Content Column */}
                <div className={`lg:col-span-6 space-y-6 ${isReversed ? "lg:order-1" : "lg:order-2"}`}>
                  <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
                    0{idx + 1} • Collection
                  </span>
                  <h2 className="text-3xl font-serif text-white font-medium">
                    {service.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">Duration</span>
                      <span className="text-zinc-200 font-medium">~{service.durationMinutes} Minutes</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">Starting At</span>
                      <span className="text-editorial-gold font-medium">{formatCurrency(service.startingPrice)}</span>
                    </div>
                  </div>

                  {service.deliverables && (
                    <div className="text-xs text-zinc-400 space-y-1">
                      <span className="text-zinc-300 font-medium block">Standard Deliverables:</span>
                      <p>{service.deliverables}</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center space-x-4">
                    <Link href={`/services/${service.slug}`}>
                      <Button variant="outline" size="md">
                        <span>Explore Packages</span>
                      </Button>
                    </Link>
                    <Link href={`/book?service=${service.slug}`}>
                      <Button variant="primary" size="md">
                        <span>Book Session</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
