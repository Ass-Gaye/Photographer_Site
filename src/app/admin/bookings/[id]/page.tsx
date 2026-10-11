import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { BookingDetailActions } from "@/components/admin/BookingDetailActions";
import { ArrowLeft, User, Calendar, Clock, MapPin, DollarSign, FileText, Send, CheckCircle2 } from "lucide-react";

interface AdminBookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({ params }: AdminBookingDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      service: true,
      package: true,
      addOns: true,
      payments: {
        orderBy: { paymentDate: "desc" },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      notifications: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  const sessionDateStr = formatDate(booking.sessionDate);

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Bookings</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
              Booking ID: #{booking.bookingReference}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-white mt-1">
              {booking.customer.fullName}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {booking.service.name} {booking.package && `— ${booking.package.name}`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        {/* Action Toolbar */}
        <BookingDetailActions
          bookingId={booking.id}
          bookingRef={booking.bookingReference}
          customerName={booking.customer.fullName}
          customerPhone={booking.customer.phone}
          sessionDateStr={sessionDateStr}
          currentStatus={booking.status}
          depositRequired={Number(booking.depositRequired)}
          balanceRemaining={Number(booking.balanceRemaining)}
          currency={booking.currency}
        />
      </div>

      {/* Grid: Details & Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Client & Session Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Client Card */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm space-y-4">
            <div className="flex items-center space-x-2 text-editorial-gold">
              <User className="w-4 h-4" />
              <h3 className="text-xs uppercase tracking-wider font-medium text-white">Client Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block text-[11px]">Full Name</span>
                <span className="text-white font-medium">{booking.customer.fullName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Email Address</span>
                <a href={`mailto:${booking.customer.email}`} className="text-zinc-300 hover:text-white underline">
                  {booking.customer.email}
                </a>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Telephone / WhatsApp</span>
                <a href={`tel:${booking.customer.phone}`} className="text-zinc-300 hover:text-white font-mono">
                  {booking.customer.phone}
                </a>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Participants</span>
                <span className="text-white">{booking.participantsCount} person(s)</span>
              </div>
            </div>
          </div>

          {/* Session Location & Timing Card */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm space-y-4">
            <div className="flex items-center space-x-2 text-editorial-gold">
              <Calendar className="w-4 h-4" />
              <h3 className="text-xs uppercase tracking-wider font-medium text-white">Session Schedule</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block text-[11px]">Scheduled Date</span>
                <span className="text-white font-medium">{sessionDateStr}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">Session Hours</span>
                <span className="text-zinc-300 font-mono">{booking.startTime} – {booking.endTime} (GMT)</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500 block text-[11px]">Location / Venue</span>
                <span className="text-white">{booking.locationVenue}</span>
              </div>
              {booking.notes && (
                <div className="sm:col-span-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-zinc-500 block text-[11px]">Client Notes / Requests:</span>
                  <p className="text-zinc-300 italic mt-0.5">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Change History */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm space-y-4">
            <div className="flex items-center space-x-2 text-editorial-gold">
              <Clock className="w-4 h-4" />
              <h3 className="text-xs uppercase tracking-wider font-medium text-white">Status History</h3>
            </div>
            <div className="space-y-3">
              {booking.statusHistory.map((h) => (
                <div key={h.id} className="p-3 bg-[#161618] border border-zinc-800/80 rounded-sm text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{h.toStatus.replace(/_/g, " ")}</span>
                    <span className="text-[11px] text-zinc-500">{formatDate(h.createdAt)}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    By {h.changedBy} {h.reason && `— ${h.reason}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Financial Ledger & Notifications */}
        <div className="lg:col-span-5 space-y-6">
          {/* Price Snapshot & Ledger */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm space-y-4">
            <div className="flex items-center space-x-2 text-editorial-gold">
              <DollarSign className="w-4 h-4" />
              <h3 className="text-xs uppercase tracking-wider font-medium text-white">Financial Snapshot</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Base Package Price</span>
                <span className="font-mono text-zinc-200">{formatCurrency(booking.basePrice)}</span>
              </div>
              {booking.addOns.length > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>Add-Ons ({booking.addOns.length})</span>
                  <span className="font-mono text-zinc-200">+{formatCurrency(booking.addOnsTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-medium text-sm pt-2 border-t border-zinc-800">
                <span>Agreed Total</span>
                <span className="font-mono text-editorial-gold">{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Required Deposit</span>
                <span className="font-mono text-zinc-300">{formatCurrency(booking.depositRequired)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Verified Deposit Paid</span>
                <span className="font-mono text-emerald-400 font-medium">{formatCurrency(booking.depositPaid)}</span>
              </div>
              <div className="flex justify-between text-white font-medium pt-2 border-t border-zinc-800">
                <span>Outstanding Balance</span>
                <span className="font-mono text-editorial-gold">{formatCurrency(booking.balanceRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Verified Payments Table */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-medium text-white">Payment Transactions</h3>
            {booking.payments.length === 0 ? (
              <p className="text-xs text-zinc-500">No payment entries recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {booking.payments.map((p) => (
                  <div key={p.id} className="p-3 bg-[#161618] border border-zinc-800/80 rounded-sm text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-white font-medium">{formatCurrency(p.amount)}</span>
                      <PaymentStatusBadge status={p.verificationStatus} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{p.paymentMethod.replace(/_/g, " ")} {p.transactionReference && `(${p.transactionReference})`}</span>
                      <span>{formatDate(p.paymentDate)}</span>
                    </div>
                    {p.notes && <p className="text-[11px] text-zinc-400 italic">{p.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification Audit Log */}
          <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm space-y-4">
            <div className="flex items-center space-x-2 text-editorial-gold">
              <Send className="w-4 h-4" />
              <h3 className="text-xs uppercase tracking-wider font-medium text-white">Notification Log</h3>
            </div>
            {booking.notifications.length === 0 ? (
              <p className="text-xs text-zinc-500">No external notifications logged for this record.</p>
            ) : (
              <div className="space-y-2">
                {booking.notifications.map((n) => (
                  <div key={n.id} className="p-2.5 bg-[#161618] border border-zinc-800/80 rounded-sm text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 font-medium truncate">{n.subject || n.channel}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-zinc-800 text-zinc-400">
                        {n.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block">{formatDate(n.createdAt)} to {n.recipient}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
