"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Calendar, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

interface NavbarProps {
  businessName?: string;
}

export function Navbar({ businessName = "ADU99" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 py-4 shadow-xl"
          : "bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/40 to-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="group flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm border border-zinc-700 bg-black overflow-hidden flex items-center justify-center group-hover:border-editorial-gold transition-colors">
            <Image
              src="/logo.jpg"
              alt="ADU Studio 99 logo"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif tracking-widest text-lg font-medium text-white group-hover:text-editorial-gold-light transition-colors">
              {businessName.toUpperCase()}
            </span>
            <span className="text-[9px] uppercase tracking-ultra text-zinc-500 font-sans">
              PHOTOGRAPHY • GAMBIA
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-widest font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-editorial-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/my-booking"
            className="text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            My Booking
          </Link>
          <Link href="/book">
            <Button variant="primary" size="sm" className="font-medium">
              <span>Book a Session</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-3">
          <Link href="/book">
            <Button variant="primary" size="sm" className="text-xs px-3 py-1.5">
              Book
            </Button>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-zinc-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0D0D10] border-b border-zinc-800 px-6 py-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-3.5 text-sm uppercase tracking-widest">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`py-1.5 ${
                  pathname === link.href ? "text-editorial-gold font-medium" : "text-zinc-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/my-booking"
              onClick={() => setIsOpen(false)}
              className="py-1.5 text-zinc-400 border-t border-zinc-800 pt-3"
            >
              Check Booking Status
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
