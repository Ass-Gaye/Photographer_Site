import React from "react";
import Link from "next/link";
import { Check, Clock, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { Button } from "@/components/ui/Button";
import { getServices, getSiteSettings } from "@/services/contentService";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Investment & Pricing Packages",
  description: "Transparent pricing packages in Gambian Dalasi (GMD) for portraits, weddings, and commercial sessions.",
};

export const revalidate = 60;

export default async function PricingPage() {
  const [services, settings] = await Promise.all([
    getServices(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24 space-y-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Studio Investment
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-medium">
            Packages & Pricing
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            Transparent pricing in Gambian Dalasi (GMD). All sessions include professional editing, high-resolution downloads, and private digital gallery access.
          </p>
        </div>

        {/* Pricing Packages Categorized by Service */}
        <div className="space-y-20">
          {services.map((service) => (
            <div key={service.id} className="space-y-8">
              <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-editorial-gold font-medium">
                    Collection
                  </span>
                  <h2 className="text-2xl font-serif text-white">{service.name}</h2>
                </div>
                <p className="text-xs text-zinc-400 max-w-md sm:text-right">
                  {service.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-6 rounded-sm border flex flex-col justify-between space-y-6 ${
                      pkg.isFeatured
                        ? "bg-[#141416] border-editorial-gold ring-1 ring-editorial-gold/40"
                        : "bg-[#101012] border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-lg text-white font-medium">{pkg.name}</h3>
                        {pkg.isFeatured && (
                          <span className="text-[9px] uppercase tracking-wider bg-editorial-gold text-black px-2 py-0.5 rounded-sm font-semibold">
                            Recommended
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-2xl sm:text-3xl font-serif text-editorial-gold">
                          {formatCurrency(pkg.price)}
                        </span>
                        <span className="text-xs text-zinc-500 ml-1.5 font-mono">GMD</span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">{pkg.description}</p>

                      <ul className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800/80 pt-4">
                        <li className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{pkg.durationMinutes} mins session duration</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{pkg.editedPhotosCount} high-resolution edited images</span>
                        </li>
                        {pkg.outfitChanges > 0 && (
                          <li className="flex items-center space-x-2">
                            <Check className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{pkg.outfitChanges} outfit changes</span>
                          </li>
                        )}
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{pkg.locationType}</span>
                        </li>
                        <li className="flex items-center space-x-2 text-zinc-400">
                          <Check className="w-3.5 h-3.5 text-zinc-400" />
                          <span>50% deposit required ({formatCurrency(pkg.depositAmount || Number(pkg.price) / 2)})</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80">
                      <Link href={`/book?service=${service.slug}`}>
                        <Button variant="primary" size="md" className="w-full">
                          <span>Book This Package</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Quotes & Large Events Note */}
        <div className="bg-[#121214] border border-zinc-800 p-8 sm:p-12 rounded-sm text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Custom Projects
          </span>
          <h3 className="text-2xl font-serif text-white">
            Need a Bespoke Multi-Day or Diplomatic Event Quote?
          </h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
            We provide custom quotes for multi-day weddings, nationwide documentation, corporate brand campaigns, and diplomatic missions across West Africa.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button variant="outline" size="md">
                <span>Request Custom Quote</span>
              </Button>
            </Link>
            <a
              href={buildWhatsAppLink(settings.whatsappNumber, "Hello ADU99 Photography, I would like to request a custom photography quote for an upcoming project.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="md">
                <MessageCircle className="w-4 h-4 mr-2" />
                <span>Chat on WhatsApp</span>
              </Button>
            </a>
          </div>
        </div>
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
