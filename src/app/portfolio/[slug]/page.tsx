import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Camera } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { Button } from "@/components/ui/Button";
import { getPortfolioProjectBySlug, getSiteSettings } from "@/services/contentService";
import { resolveInstagramImage } from "@/lib/instagramImages";
import { formatDate } from "@/lib/utils";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getPortfolioProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} | ADU99 Photography`,
    description: project.description || `Visual story from ADU99 Photography in ${project.location || "The Gambia"}`,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getPortfolioProjectBySlug(slug),
    getSiteSettings(),
  ]);

  if (!project || !project.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 sm:px-8 pt-36 pb-24 space-y-16">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/portfolio"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Works</span>
          </Link>
        </div>

        {/* Project Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            {project.category.name}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-white font-medium leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400 pt-2">
            {project.location && (
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-editorial-gold" />
                <span>{project.location}</span>
              </span>
            )}
            {project.shootDate && (
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-editorial-gold" />
                <span>{formatDate(project.shootDate)}</span>
              </span>
            )}
            <span className="flex items-center space-x-1.5">
              <Camera className="w-3.5 h-3.5 text-editorial-gold" />
              <span>ADU99 Studio Archive</span>
            </span>
          </div>

          {project.description && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Project Images Gallery */}
        <div className="space-y-12">
          {project.images.map((img, idx) => (
            <div key={img.id} className="space-y-3">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-sm overflow-hidden bg-zinc-900 border border-zinc-800">
                <Image
                  src={resolveInstagramImage(img.url, idx)}
                  alt={img.altText || project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority={idx === 0}
                />
              </div>
              {img.caption && (
                <p className="text-xs text-zinc-400 italic font-serif text-center">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Booking Conversion Banner */}
        <div className="pt-12 border-t border-zinc-900 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-serif text-white">
            Inspired by this series?
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Book a tailored photography experience crafted with the same editorial attention to light, mood, and natural poise.
          </p>
          <div className="pt-2">
            <Link href="/book">
              <Button variant="primary" size="md">
                <span>Book Similar Session</span>
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
