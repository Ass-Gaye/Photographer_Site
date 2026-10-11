"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppFloatingProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppFloating({
  phoneNumber = "+2203135947",
  defaultMessage = "Hello ADU99 Photography, I would like to inquire about booking a session.",
}: WhatsAppFloatingProps) {
  const href = buildWhatsAppLink(phoneNumber, defaultMessage);

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with ADU99 Photography"
        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
