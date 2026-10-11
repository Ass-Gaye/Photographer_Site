import React from "react";
import Link from "next/link";
import { lookupBooking } from "@/services/bookingService";
import { getSiteSettings } from "@/services/contentService";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { CheckCircle2, Clock, AlertCircle, MessageCircle, Calendar, MapPin, Receipt, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Track Your Booking | ADU99 Photography",
  description: "Securely review your photography session schedule, deposit status, and remaining balance.",
};

interface MyBookingPageProps {
  searchParams: Promise<{ ref?: string; email?: string; error?: string }>;
}

export default async function MyBookingPage({ searchParams }: MyBookingPageProps) {
  const { ref, email, error } = await searchParams;
  const settings = await getSiteSettings();

  let booking = null;
  let lookupError = error || null;

  if (ref && email) {
    booking = await lookupBooking(ref, email);
    if (!booking) {
      lookupError = "No matching booking found. Please check both the booking reference and your email/phone.";
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans">
      <Navbar businessName={settings.businessName} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-36 pb-20">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Client Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-medium">
            Booking Status & Details
          </h1>
          <p className="text-xs text-zinc-400">
            Enter your booking reference along with your email address or phone number to access your confirmed schedule and payment records.
          </p>
        </div>

        {/* Lookup Search Form */}
        <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm mb-12 shadow-xl">
          <form action="/my-booking" method="GET" className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-2">
              <Input
                name="ref"
                defaultValue={ref || ""}
                label="Booking Reference"
                placeholder="e.g. ADU-261234-ABCD"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                name="email"
                defaultValue={email || ""}
                label="Email or Phone Number"
                placeholder="e.g. mariama@example.com"
                required
              />
            </div>
            <div className="sm:col-span-1 flex items-end">
              <Button type="submit" variant="primary" size="md" className="w-full">
                <span>Look Up</span>
              </Button>
            </div>
          </form>

          {lookupError && (
            <div className="mt-4 p-4 bg-red-950/40 border border-red-800 rounded-sm text-xs text-red-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{lookupError}</span>
            </div>
          )}
        </div>

        {/* Booking Details Display */}
        {booking && (
          <div className="bg-[#121214] border border-zinc-800 rounded-sm overflow-hidden shadow-2xl animate-fade-in space-y-8 p-6 sm:p-10">
            {/* Header Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
                  Reference: #{booking.bookingReference}
                </span>
                <h2 className="text-2xl font-serif text-white mt-1">
                  {booking.service.name} {booking.package && `— ${booking.package.name}`}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Booked by {booking.customer.fullName} ({booking.customer.email})
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>

            {/* Session Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="bg-[#161618] p-4 rounded-sm border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-editorial-gold">
                  <Calendar className="w-4 h-4" />
                  <span className="uppercase tracking-wider font-medium text-[10px]">Session Date</span>
                </div>
                <p className="text-sm font-medium text-white">{formatDate(booking.sessionDate)}</p>
                <p className="text-zinc-500 font-mono">{booking.startTime} – {booking.endTime} (GMT)</p>
              </div>

              <div className="bg-[#161618] p-4 rounded-sm border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-editorial-gold">
                  <MapPin className="w-4 h-4" />
                  <span className="uppercase tracking-wider font-medium text-[10px]">Location / Venue</span>
                </div>
                <p className="text-sm font-medium text-white">{booking.locationVenue}</p>
                <p className="text-zinc-500">{booking.participantsCount} participant(s)</p>
              </div>

              <div className="bg-[#161618] p-4 rounded-sm border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-editorial-gold">
                  <Clock className="w-4 h-4" />
                  <span className="uppercase tracking-wider font-medium text-[10px]">Deliverables</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {booking.package ? `${booking.package.editedPhotosCount} Edited Images` : "Custom Archive"}
                </p>
                <p className="text-zinc-500">Digital private gallery download</p>
              </div>
            </div>

            {/* Financial Ledger & Balance Summary */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-medium">
                Payment & Balance Ledger
              </h3>
              <div className="bg-[#161618] p-6 rounded-sm border border-zinc-800 text-xs space-y-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Agreed Session Total</span>
                  <span className="font-mono text-zinc-200">{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Required Deposit</span>
                  <span className="font-mono text-zinc-200">{formatCurrency(booking.depositRequired)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Verified Deposit Received</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {formatCurrency(booking.depositPaid)}
                  </span>
                </div>
                <div className="flex justify-between text-white font-medium text-sm pt-3 border-t border-zinc-800">
                  <span>Remaining Balance</span>
                  <span className="font-mono text-editorial-gold">
                    {formatCurrency(booking.balanceRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Instructions if Deposit or Balance is Due */}
            {Number(booking.balanceRemaining) > 0 && (
              <div className="bg-amber-950/20 border border-amber-800/40 p-6 rounded-sm space-y-3 text-xs">
                <h4 className="text-amber-300 font-medium uppercase tracking-wider text-[11px] flex items-center space-x-2">
                  <Receipt className="w-4 h-4" />
                  <span>Payment Instructions for The Gambia</span>
                </h4>
                <div className="space-y-2 text-zinc-300">
                  <p>
                    <strong className="text-white">Wave / Mobile Money:</strong>{" "}
                    {settings.wavePaymentInstructions}
                  </p>
                  <p>
                    <strong className="text-white">Direct Bank Transfer:</strong>{" "}
                    {settings.bankTransferInstructions}
                  </p>
                </div>
                <p className="text-[11px] text-zinc-500 pt-1">
                  Always include your booking reference <strong className="text-zinc-300">#{booking.bookingReference}</strong> when sending payments so our studio can verify and credit your balance immediately.
                </p>
              </div>
            )}

            {/* Payment History Records */}
            {booking.payments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-medium">
                  Recorded Payments
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-zinc-800">
                    <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Reference</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {booking.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="p-3 text-zinc-400">{formatDate(p.paymentDate)}</td>
                          <td className="p-3 text-zinc-300">{p.paymentMethod.replace(/_/g, " ")}</td>
                          <td className="p-3 font-mono text-zinc-400">{p.transactionReference || "—"}</td>
                          <td className="p-3 font-mono text-white font-medium">{formatCurrency(p.amount)}</td>
                          <td className="p-3">
                            <PaymentStatusBadge status={p.verificationStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Communication Shortcut */}
            <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href={buildWhatsAppLink(
                  settings.whatsappNumber,
                  `Hello ADU99 Photography, I am inquiring about my booking #${booking.bookingReference}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-sm text-xs font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Studio on WhatsApp</span>
              </a>

              <Link href="/contact" className="text-xs text-zinc-400 hover:text-white transition-colors">
                Need to request rescheduling or have special questions? Contact us &rarr;
              </Link>
            </div>
          </div>
        )}
      </main>

      <WhatsAppFloating phoneNumber={settings.whatsappNumber} />
      <Footer settings={settings} />
    </div>
  );
}
