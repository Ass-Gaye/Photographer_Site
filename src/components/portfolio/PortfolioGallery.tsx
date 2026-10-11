"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";
import { Lightbox, LightboxImage } from "./Lightbox";
import { resolveInstagramImage } from "@/lib/instagramImages";

interface ProjectImage {
  id: string;
  url: string;
  caption?: string | null;
  altText: string;
}

interface Project {
  id: string;
  slug: string;
  title: string;
  location?: string | null;
  coverImage: string;
  category: {
    id: string;
    slug: string;
    name: string;
  };
  images: ProjectImage[];
}

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface PortfolioGalleryProps {
  categories: Category[];
  initialProjects: Project[];
}

export function PortfolioGallery({ categories, initialProjects }: PortfolioGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(0);

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") return initialProjects;
    return initialProjects.filter((p) => p.category.slug === selectedCategory);
  }, [selectedCategory, initialProjects]);

  // Flatten all images for lightbox viewing (resolved to local Instagram files)
  const allImages = useMemo<LightboxImage[]>(() => {
    const list: LightboxImage[] = [];
    filteredProjects.forEach((proj, pIdx) => {
      if (proj.images.length > 0) {
        proj.images.forEach((img, iIdx) => {
          list.push({
            id: img.id,
            url: resolveInstagramImage(img.url, pIdx * 4 + iIdx),
            caption: img.caption || proj.title,
            altText: img.altText || proj.title,
          });
        });
      } else {
        list.push({
          id: proj.id,
          url: resolveInstagramImage(proj.coverImage, pIdx),
          caption: proj.title,
          altText: proj.title,
        });
      }
    });
    return list;
  }, [filteredProjects]);

  const openLightboxWithImage = (url: string) => {
    const index = allImages.findIndex((img) => img.url === url);
    if (index !== -1) {
      setActiveLightboxIndex(index);
    } else {
      setActiveLightboxIndex(0);
    }
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 text-xs uppercase tracking-widest transition-all rounded-sm font-medium ${
            selectedCategory === "all"
              ? "bg-editorial-ivory text-black"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800"
          }`}
        >
          All Works
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 text-xs uppercase tracking-widest transition-all rounded-sm font-medium ${
              selectedCategory === cat.slug
                ? "bg-editorial-ivory text-black"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="py-24 text-center space-y-4 border border-dashed border-zinc-800 rounded-sm p-8 max-w-lg mx-auto">
          <Camera className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-serif text-zinc-300">No projects published in this collection yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            New curated series are added regularly. Browse other collections or contact the studio to see tailored archives.
          </p>
          <button
            onClick={() => setSelectedCategory("all")}
            className="text-xs uppercase tracking-widest text-editorial-gold hover:underline pt-2 inline-block"
          >
            View All Archives
          </button>
        </div>
      )}

      {/* Editorial Masonry Grid */}
      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <div
              key={project.id}
              className="group relative flex flex-col space-y-3 bg-[#111113] p-3 rounded-sm border border-zinc-800/80 hover:border-zinc-700 transition-colors"
            >
              {/* Image Container */}
              <div
                onClick={() => openLightboxWithImage(resolveInstagramImage(project.coverImage, idx))}
                className="relative aspect-[4/5] w-full overflow-hidden rounded-sm cursor-zoom-in bg-zinc-900"
              >
                <Image
                  src={resolveInstagramImage(project.coverImage, idx)}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-xs uppercase tracking-widest text-white/90 font-medium">
                    View Lightbox
                  </span>
                </div>
              </div>

              {/* Metadata & Project Link */}
              <div className="pt-2 flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
                    {project.category.name}
                  </span>
                  <h3 className="font-serif text-base text-zinc-100 font-medium group-hover:text-white">
                    <Link href={`/portfolio/${project.slug}`} className="hover:underline">
                      {project.title}
                    </Link>
                  </h3>
                  {project.location && (
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      {project.location}
                    </p>
                  )}
                </div>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="p-2 text-zinc-500 hover:text-white rounded-full bg-zinc-900 transition-colors"
                  aria-label={`View story for ${project.title}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        images={allImages}
        currentIndex={activeLightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(newIndex) => setActiveLightboxIndex(newIndex)}
      />
    </div>
  );
}
