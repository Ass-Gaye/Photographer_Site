import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Sparkles, Award, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { Button } from "@/components/ui/Button";
import { getSiteSettings } from "@/services/contentService";

export const metadata = {
  title: "About the Studio & Philosophy",
  description: "Learn about ADU99 Photography's creative journey, philosophy, and artistic vision in The Gambia.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24 space-y-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Studio Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-medium">
            About ADU99 Photography
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            Capturing profound, editorial, and timeless moments across The Gambia and West Africa.
          </p>
        </div>

        {/* Narrative & Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative aspect-[4/5] rounded-sm overflow-hidden bg-zinc-900 border border-zinc-800">
            <Image
              src="/instagram/post-9.jpg"
              alt="ADU Studio 99 lead photographer at work"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
              The Vision
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white font-medium leading-tight">
              An Editorial Approach to Real Life.
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              <p>
                {settings.bio}
              </p>
              <p>
                Rooted in the distinctive warm light and rich cultural textures of The Gambia, ADU99 Photography balances documentary honesty with cinematic composition. We do not manufacture stiff poses; we guide our subjects into comfort, allowing authenticity to speak for itself.
              </p>
              <p>
                From quiet bridal portraits along the coastal shores of Bakau and Fajara to lively cultural celebrations in Banjul, our ambition is to produce heirlooms you will treasure decades from now.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-800/80 text-xs">
              <div>
                <span className="text-white font-serif text-base block font-medium">Natural Warmth</span>
                <span className="text-zinc-500 text-[11px]">Cinematic, true-to-life skin tones</span>
              </div>
              <div>
                <span className="text-white font-serif text-base block font-medium">Tailored Art Direction</span>
                <span className="text-zinc-500 text-[11px]">Collaborative moodboards and styling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Behind The Scenes & Equipment Overview */}
        <div className="bg-[#121214] border border-zinc-800 p-8 sm:p-12 rounded-sm space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
              Studio Craft
            </span>
            <h3 className="text-2xl font-serif text-white">
              Equipment & Technical Rigor
            </h3>
            <p className="text-xs text-zinc-400">
              We employ professional full-frame camera systems, prime lenses, and studio strobe modifiers to deliver crystal-clear resolution under any lighting scenario.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-300">
            <div className="p-4 bg-zinc-900/60 rounded-sm border border-zinc-800/60 space-y-2">
              <Camera className="w-5 h-5 text-editorial-gold" />
              <h4 className="font-medium text-white">Full-Frame Precision</h4>
              <p className="text-zinc-400 text-[11px]">
                High-dynamic-range camera bodies ensuring shadow detail, rich color grading, and archival clarity.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/60 rounded-sm border border-zinc-800/60 space-y-2">
              <Sparkles className="w-5 h-5 text-editorial-gold" />
              <h4 className="font-medium text-white">Dedicated Lighting</h4>
              <p className="text-zinc-400 text-[11px]">
                Mobile and studio strobes with softboxes capable of handling both indoor ceremonies and bright midday sun.
              </p>
            </div>

            <div className="p-4 bg-zinc-900/60 rounded-sm border border-zinc-800/60 space-y-2">
              <MapPin className="w-5 h-5 text-editorial-gold" />
              <h4 className="font-medium text-white">On-Location Mobility</h4>
              <p className="text-zinc-400 text-[11px]">
                Equipped for studio sessions in the Greater Banjul Area as well as remote outdoor shoots across The Gambia.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-serif text-white">
            Ready to Plan Your Session?
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Review available dates or send us an inquiry with your creative ideas.
          </p>
          <div className="pt-2">
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
