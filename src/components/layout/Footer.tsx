import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

interface FooterProps {
  settings?: {
    businessName?: string;
    phone?: string;
    whatsappNumber?: string;
    email?: string;
    addressOrArea?: string;
    instagramUrl?: string;
    facebookUrl?: string;
  };
}

export function Footer({ settings }: FooterProps) {
  const businessName = settings?.businessName || "ADU99 Photography";
  const phone = settings?.phone || "+220 3135947 / +220 2135552";
  const whatsappNumber = settings?.whatsappNumber || "+2203135947";
  const email = settings?.email || "contact@adu99photography.com";
  const address = settings?.addressOrArea || "Wellingara, Latrikunda Highway, The Gambia";

  const whatsappHref = buildWhatsAppLink(
    whatsappNumber,
    "Hello ADU99 Photography, I would like to inquire about booking a photography session."
  );

  return (
    <footer className="bg-[#080809] border-t border-zinc-900 text-zinc-400 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-9 h-9 rounded-sm overflow-hidden border border-zinc-800 bg-black shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="ADU Studio 99 logo"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="font-serif tracking-widest text-lg font-medium">
                {businessName}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Cinematic visual stories, individual and bridal portraits, and milestone documentation
              crafted with natural tones and timeless editorial composition in The Gambia.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-zinc-400">
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-editorial-gold transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-editorial-gold transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-200">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors">
                  Portfolio Galleries
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Services Overview
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Packages & Pricing
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-editorial-gold hover:underline transition-colors">
                  Book a Session
                </Link>
              </li>
              <li>
                <Link href="/my-booking" className="hover:text-white transition-colors">
                  Manage / Track Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-200">
              Client & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/booking-policy" className="hover:text-white transition-colors">
                  Booking & Deposit Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Notice
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-200">
              Studio & Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                <span>{address}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 text-xs font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>WhatsApp Studio Inquiry</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="hover:text-zinc-300 transition-colors">
              Studio Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
