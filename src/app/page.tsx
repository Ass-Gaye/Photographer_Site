import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Sparkles, Clock, Check, Quote, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { Button } from "@/components/ui/Button";
import {
  getSiteSettings,
  getPortfolioProjects,
  getServices,
  getTestimonials,
} from "@/services/contentService";
import { HOMEPAGE_HERO_IMAGE, resolveInstagramImage } from "@/lib/instagramImages";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const [settings, featuredProjects, services, testimonials] = await Promise.all([
    getSiteSettings(),
    getPortfolioProjects(undefined, true),
    getServices(),
    getTestimonials(),
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={HOMEPAGE_HERO_IMAGE}
            alt="ADU Studio 99 photographer shooting on location"
            fill
            priority
            className="object-cover object-center scale-105 animate-scale-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(10,10,10,0.8)_100%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-6 pt-16">
          <div className="inline-flex items-center space-x-2 border border-white/10 bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs uppercase tracking-widest text-editorial-gold font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-editorial-gold" />
            <span>Editorial & Portrait Studio • The Gambia</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-white font-medium tracking-tight leading-[1.1]">
            Cinematic Visuals.
            <br />
            <span className="italic font-normal text-zinc-300">Timeless Stories.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-300 font-sans font-normal leading-relaxed">
            {settings.bio}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <span>Book a Session</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <span>Explore Portfolio</span>
              </Button>
            </Link>
          </div>

          {/* Quick Stats or Sub-bar */}
          <div className="pt-16 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-xl mx-auto border-t border-white/10 text-xs">
            <div>
              <span className="block font-serif text-xl sm:text-2xl text-white font-medium">Studio & Outdoor</span>
              <span className="text-[10px] uppercase tracking-ultra text-zinc-400">Locations</span>
            </div>
            <div>
              <span className="block font-serif text-xl sm:text-2xl text-white font-medium">Hand Retouched</span>
              <span className="text-[10px] uppercase tracking-ultra text-zinc-400">Master Edits</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block font-serif text-xl sm:text-2xl text-white font-medium">Gambia & Travel</span>
              <span className="text-[10px] uppercase tracking-ultra text-zinc-400">Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL PORTFOLIO HIGHLIGHTS */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/80 pb-8">
          <div>
            <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
              Curated Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium mt-1">
              Selected Archives
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-lg">
              Explore recent portrait studies, matrimonial celebrations, and creative editorial commissions.
            </p>
          </div>
          <Link href="/portfolio">
            <Button variant="outline" size="sm">
              <span>View All Projects</span>
              <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProjects.slice(0, 3).map((proj, idx) => (
            <div
              key={proj.id}
              className="group relative flex flex-col space-y-3 bg-[#111113] p-3 rounded-sm border border-zinc-800/80 hover:border-zinc-700 transition-colors"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-zinc-900">
                <Image
                  src={resolveInstagramImage(proj.coverImage, idx)}
                  alt={proj.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="pt-2 flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
                    {proj.category.name}
                  </span>
                  <h3 className="font-serif text-base text-white font-medium mt-0.5">
                    <Link href={`/portfolio/${proj.slug}`} className="hover:underline">
                      {proj.title}
                    </Link>
                  </h3>
                  {proj.location && (
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">{proj.location}</p>
                  )}
                </div>
                <Link
                  href={`/portfolio/${proj.slug}`}
                  className="p-2 text-zinc-500 hover:text-white rounded-full bg-zinc-900 transition-colors"
                  aria-label={`View story ${proj.title}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SERVICES & PACKAGES OVERVIEW */}
      <section className="py-24 bg-[#0E0E10] border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
              Tailored Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium">
              Photography Services
            </h2>
            <p className="text-xs text-zinc-400">
              Clear deliverables, transparent Dalasi pricing, and bespoke attention to every session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#141416] border border-zinc-800 p-6 rounded-sm flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-editorial-gold">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-white font-medium">{service.name}</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="pt-2 text-xs text-zinc-500 space-y-1">
                    <p>• Duration: ~{service.durationMinutes} mins</p>
                    <p>• Starting: {formatCurrency(service.startingPrice)}</p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between">
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-xs uppercase tracking-wider text-editorial-gold hover:underline font-medium"
                  >
                    View Details
                  </Link>
                  <Link href={`/book?service=${service.slug}`}>
                    <Button variant="secondary" size="sm">
                      Book
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link href="/pricing" className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white underline">
              View all package breakdowns and optional extras &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PHOTOGRAPHER INTRODUCTION & ARTISTIC PHILOSOPHY */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 relative aspect-[4/5] rounded-sm overflow-hidden border border-zinc-800">
            <Image
              src="/instagram/post-9.jpg"
              alt="ADU Studio 99 lead photographer at work"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>

          <div className="md:col-span-7 space-y-6">
            <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
              Behind the Lens
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium leading-tight">
              Honoring Authentic Character Through Light and Patience.
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                ADU99 Photography was founded on the belief that a memorable photograph is more than sharp focus; it is an emotional resonance that outlives the fleeting moment.
              </p>
              <p>
                Whether photographing a radiant bride along the Gambian coastline, directing an editorial concept in studio, or documenting families celebrating lifelong achievements, our creative philosophy remains anchored in natural presence, gentle direction, and refined tone grading.
              </p>
            </div>
            <div className="pt-4 flex items-center space-x-6">
              <Link href="/about">
                <Button variant="outline" size="md">
                  <span>Read Full Story</span>
                </Button>
              </Link>
              <Link href="/book">
                <Button variant="gold" size="md">
                  <span>Inquire for a Date</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GENUINE CLIENT TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-[#0E0E10] border-y border-zinc-900">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
                Client Experiences
              </span>
              <h2 className="text-3xl font-serif text-white font-medium">
                Words from Our Clients
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#141416] border border-zinc-800 p-8 rounded-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <Quote className="w-6 h-6 text-editorial-gold/40" />
                    <p className="text-xs text-zinc-300 italic font-serif leading-relaxed">
                      &ldquo;{t.quotation}&rdquo;
                    </p>
                  </div>
                  <div className="pt-4 border-t border-zinc-800 flex items-center space-x-3">
                    {t.photoUrl && (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-700">
                        <Image src={t.photoUrl} alt={t.clientName} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-medium text-white">{t.clientName}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t.roleOrEvent}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CALL TO ACTION & BOOKING CONVERSION */}
      <section className="py-24 text-center max-w-4xl mx-auto px-6 sm:px-8 space-y-8">
        <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
          Ready for Your Session?
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-white font-medium leading-tight">
          Let&apos;s Create Something Timeless Together.
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Check live date availability, choose your preferred package, and secure your session on our studio calendar today.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/book">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <span>Book Your Session Now</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <span>Contact Studio Directly</span>
            </Button>
          </Link>
        </div>
      </section>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
