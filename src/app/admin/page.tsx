import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getDashboardOverviewMetrics } from "@/services/contentService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Clock,
  AlertCircle,
  CreditCard,
  Users,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const metrics = await getDashboardOverviewMetrics();

  // Fetch pending booking requests awaiting photographer approval
  const pendingBookings = await prisma.booking.findMany({
    where: { status: BookingStatus.PENDING_CONFIRMATION },
    include: { customer: true, service: true, package: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch today's and upcoming sessions
  const now = new Date();
  const upcomingSessions = await prisma.booking.findMany({
    where: {
      sessionDate: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.DEPOSIT_PAID, BookingStatus.FULLY_PAID] },
    },
    include: { customer: true, service: true },
    orderBy: { sessionDate: "asc" },
    take: 5,
  });

  // Recent Inquiries
  const recentInquiries = await prisma.inquiry.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Studio Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium">
            Business & Schedule Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time session records, client confirmations, and Gambian Dalasi ledger status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/admin/bookings">
            <Button variant="primary" size="sm">
              <span>Manage All Bookings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#121214] border border-zinc-800 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] uppercase tracking-wider">Today&apos;s Sessions</span>
            <Clock className="w-4 h-4 text-editorial-gold" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-white font-medium">
            {metrics.todaysSessions}
          </div>
          <p className="text-[11px] text-zinc-500">
            {metrics.upcomingBookings} upcoming confirmed
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#121214] border border-zinc-800 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] uppercase tracking-wider">Pending Requests</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-amber-300 font-medium">
            {metrics.pendingRequests}
          </div>
          <p className="text-[11px] text-zinc-500">
            Requires studio confirmation
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#121214] border border-zinc-800 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] uppercase tracking-wider">Verified Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-emerald-400 font-medium">
            {formatCurrency(metrics.totalVerifiedRevenue)}
          </div>
          <p className="text-[11px] text-zinc-500">
            Actual collected cash & transfers
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#121214] border border-zinc-800 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] uppercase tracking-wider">Outstanding Balance</span>
            <TrendingUp className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-white font-medium">
            {formatCurrency(metrics.totalOutstandingBalance)}
          </div>
          <p className="text-[11px] text-zinc-500">
            Deposits due: {formatCurrency(metrics.totalOutstandingDeposit)}
          </p>
        </div>
      </div>

      {/* 2-Column Section: Pending Requests & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending Requests Needing Approval */}
        <div className="lg:col-span-7 bg-[#121214] border border-zinc-800 rounded-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="font-serif text-lg text-white font-medium">
                Pending Booking Requests
              </h3>
              <p className="text-xs text-zinc-400">
                Awaiting your approval before dates are officially confirmed.
              </p>
            </div>
            <Link href="/admin/bookings?status=PENDING_CONFIRMATION" className="text-xs text-editorial-gold hover:underline">
              View all
            </Link>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No pending booking requests at this time. All caught up!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 bg-[#161618] border border-zinc-800/80 rounded-sm flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-zinc-400">#{b.bookingReference}</span>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <p className="text-xs font-medium text-white">
                      {b.customer.fullName} • {b.service.name}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {formatDate(b.sessionDate)} at {b.startTime} • Total: {formatCurrency(b.totalAmount)}
                    </p>
                  </div>

                  <Link href={`/admin/bookings/${b.id}`}>
                    <Button variant="secondary" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Upcoming Confirmed Sessions */}
        <div className="lg:col-span-5 bg-[#121214] border border-zinc-800 rounded-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="font-serif text-lg text-white font-medium">
                Upcoming Confirmed Sessions
              </h3>
              <p className="text-xs text-zinc-400">Scheduled on the studio calendar</p>
            </div>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No upcoming sessions scheduled in the near future.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((b) => (
                <div key={b.id} className="p-3.5 bg-[#161618] border border-zinc-800/80 rounded-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">{b.customer.fullName}</span>
                    <span className="text-[11px] font-mono text-editorial-gold">{b.startTime}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{b.service.name}</p>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span>{formatDate(b.sessionDate)}</span>
                    <span className="text-zinc-400">{b.locationVenue}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Inquiries List */}
      <div className="bg-[#121214] border border-zinc-800 rounded-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-serif text-lg text-white font-medium">
              Recent Website Inquiries
            </h3>
            <p className="text-xs text-zinc-400">Custom quotes and general questions from prospective clients</p>
          </div>
          <Link href="/admin/inquiries" className="text-xs text-editorial-gold hover:underline">
            View all inquiries
          </Link>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No open website inquiries right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="p-4 bg-[#161618] border border-zinc-800/80 rounded-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{inq.fullName}</span>
                  <span className="text-zinc-500">{formatDate(inq.createdAt)}</span>
                </div>
                <p className="text-zinc-400 line-clamp-2">{inq.message}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-zinc-800">
                  <span className="text-editorial-gold">{inq.serviceInterested || "General"}</span>
                  <Link href="/admin/inquiries" className="text-zinc-300 hover:text-white underline">
                    Reply / Convert &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
