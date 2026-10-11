import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with Gambian Dalasi (GMD) or configured currency
 */
export function formatCurrency(amount: number | string | { toString(): string } | null | undefined, currency = "GMD"): string {
  if (amount === null || amount === undefined) return `D 0.00`;
  const num = typeof amount === "number" ? amount : parseFloat(amount.toString());
  if (isNaN(num)) return `D 0.00`;

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);

  if (currency.toUpperCase() === "GMD") {
    return `D ${formattedNumber}`;
  }
  return `${formattedNumber} ${currency}`;
}

/**
 * Format dates consistently for Gambia (GMT / UTC)
 */
export function formatDate(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Banjul",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Banjul",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Generates human-friendly booking reference like ADU-26-8942
 */
export function generateBookingReference(): string {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `ADU-${yearSuffix}${digits}-${randomChars}`;
}

/**
 * Convert time string "14:30" to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Convert minutes from midnight to "14:30" string
 */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
