/**
 * Formats a phone number for WhatsApp wa.me links
 * Strips out +, spaces, dashes, parentheses
 */
export function sanitizeWhatsAppPhone(phone: string): string {
  // If phone starts with +220 or 220 or local 7xxxxxx / 3xxxxxx
  let cleaned = phone.replace(/[^0-9]/g, "");
  // If local 7-digit Gambian number like 7999999 or 3000000, prepend 220
  if (cleaned.length === 7) {
    cleaned = `220${cleaned}`;
  }
  return cleaned;
}

/**
 * Builds the official WhatsApp click-to-chat URL
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = sanitizeWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Generate standard messages
 */
export function getBookingInquiryWhatsAppMessage(bookingRef: string, serviceName: string, dateStr: string, timeStr: string): string {
  return `Hello ADU99 Photography, I have submitted booking request #${bookingRef} for ${serviceName} on ${dateStr} at ${timeStr}. Please confirm availability and let me know the next steps.`;
}

export function getGeneralInquiryWhatsAppMessage(name: string, subject?: string): string {
  return `Hello ADU99 Photography, my name is ${name}. I am inquiring about photography sessions${subject ? ` for ${subject}` : ""}.`;
}

export function getAdminClientFollowUpWhatsAppMessage(clientName: string, bookingRef: string, dateStr: string): string {
  return `Hello ${clientName}, this is ADU99 Photography regarding your booking #${bookingRef} scheduled for ${dateStr}.`;
}
