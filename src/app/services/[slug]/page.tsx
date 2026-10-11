import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { Button } from "@/components/ui/Button";
import { getServiceBySlug, getSiteSettings } from "@/services/contentService";
import { resolveInstagramImage } from "@/lib/instagramImages";
import { formatCurrency } from "@/lib/utils";

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service Not Found" };

  return {
    title: `${service.name} | ADU99 Photography`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
  ]);

  if (!service || !service.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24 space-y-16">
        <div>
          <Link
            href="/services"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Services</span>
          </Link>
        </div>

        {/* Hero Banner for Service */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
              Studio Service
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif text-white font-medium leading-tight">
              {service.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {service.description}
            </p>
            <div className="pt-2 flex items-center space-x-4">
              <Link href={`/book?service=${service.slug}`}>
                <Button variant="primary" size="md">
                  <span>Book This Service</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 relative aspect-[4/3] rounded-sm overflow-hidden bg-zinc-900 border border-zinc-800">
            {service.coverImage && (
              <Image
                src={resolveInstagramImage(service.coverImage, 0)}
                alt={service.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
            )}
          </div>
        </div>

        {/* Available Packages */}
        <div className="space-y-8 pt-8 border-t border-zinc-900">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
              Options & Inclusions
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-white font-medium">
              Available Packages
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-6 rounded-sm border flex flex-col justify-between space-y-6 ${
                  pkg.isFeatured
                    ? "bg-[#161618] border-editorial-gold/60 ring-1 ring-editorial-gold/30"
                    : "bg-[#121214] border-zinc-800"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-xl text-white">{pkg.name}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{pkg.description}</p>
                    </div>
                    {pkg.isFeatured && (
                      <span className="text-[10px] uppercase tracking-wider bg-editorial-gold/20 text-editorial-gold border border-editorial-gold/40 px-2 py-0.5 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <span className="text-2xl font-serif text-editorial-gold">
                      {formatCurrency(pkg.price)}
                    </span>
                    <span className="text-xs text-zinc-500 ml-2">GMD</span>
                  </div>

                  <ul className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800/80 pt-4">
                    <li className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-editorial-gold" />
                      <span>{pkg.durationMinutes} Minutes Session</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-editorial-gold" />
                      <span>{pkg.editedPhotosCount} Hand-Retouched High-Res Photos</span>
                    </li>
                    {pkg.outfitChanges > 0 && (
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-editorial-gold" />
                        <span>{pkg.outfitChanges} Outfit Changes Included</span>
                      </li>
                    )}
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-editorial-gold" />
                      <span>{pkg.locationType}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-zinc-800/80">
                  <Link href={`/book?service=${service.slug}`}>
                    <Button variant="primary" size="md" className="w-full">
                      <span>Select {pkg.name}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Add-Ons */}
        {service.addOns.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-zinc-900">
            <h3 className="text-xl font-serif text-white">Add-Ons & Extras</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {service.addOns.map((addon) => (
                <div
                  key={addon.id}
                  className="p-4 bg-[#141416] border border-zinc-800 rounded-sm flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-medium text-white">{addon.name}</h4>
                    {addon.description && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{addon.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-mono text-editorial-gold font-medium">
                    +{formatCurrency(addon.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
