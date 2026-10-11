"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxImage {
  id: string;
  url: string;
  caption?: string | null;
  altText: string;
}

interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function Lightbox({ images, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(images.length - 1); // loop
    }
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0); // loop
    }
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox Preview"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fade-in"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between text-zinc-400 z-10">
        <span className="text-xs uppercase tracking-widest font-mono">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/60 hover:bg-zinc-800 transition-colors"
          aria-label="Close Lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Area with Prev/Next Controls */}
      <div className="relative flex-1 flex items-center justify-center max-w-6xl mx-auto w-full my-4">
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition-all focus:outline-none"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center">
          <Image
            src={currentImage.url}
            alt={currentImage.altText || "Photography work"}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition-all focus:outline-none"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption Bottom Bar */}
      <div className="max-w-2xl mx-auto text-center space-y-1 pb-2 z-10">
        {currentImage.caption && (
          <p className="text-sm text-zinc-200 font-serif italic">
            {currentImage.caption}
          </p>
        )}
        <p className="text-xs text-zinc-500 uppercase tracking-wider">
          ADU99 Studio Archive
        </p>
      </div>
    </div>
  );
}
