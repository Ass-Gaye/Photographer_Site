import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { BookingStatus, Prisma } from "@prisma/client";
import { Search, Download, Calendar, Filter, Eye } from "lucide-react";

interface AdminBookingsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    serviceId?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  await requireAdmin();
  const { q, status, serviceId } = await searchParams;

  const whereClause: Prisma.BookingWhereInput = {};

  if (q && q.trim()) {
    const searchTerm = q.trim();
    whereClause.OR = [
      { bookingReference: { contains: searchTerm, mode: "insensitive" } },
      { customer: { fullName: { contains: searchTerm, mode: "insensitive" } } },
      { customer: { email: { contains: searchTerm, mode: "insensitive" } } },
      { customer: { phone: { contains: searchTerm, mode: "insensitive" } } },
    ];
  }

  if (status && Object.values(BookingStatus).includes(status as BookingStatus)) {
    whereClause.status = status as BookingStatus;
  }

  if (serviceId) {
    whereClause.serviceId = serviceId;
  }

  const [bookings, services] = await Promise.all([
    prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: true,
        service: true,
        package: true,
      },
      orderBy: { sessionDate: "desc" },
    }),
    prisma.service.findMany({ select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Schedule Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium">
            Bookings Ledger
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage incoming requests, confirmed sessions, deposits, and status changes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a href="/api/admin/bookings/export" download>
            <Button variant="secondary" size="sm">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Export CSV</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121214] border border-zinc-800 p-4 rounded-sm">
        <form method="GET" action="/admin/bookings" className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-5 relative">
            <input
              name="q"
              defaultValue={q || ""}
              placeholder="Search reference, customer name, email, phone..."
              className="w-full bg-[#18181A] border border-zinc-700 rounded-sm px-3.5 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-editorial-gold text-xs"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              name="status"
              defaultValue={status || ""}
              className="w-full bg-[#18181A] border border-zinc-700 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-editorial-gold text-xs"
            >
              <option value="">All Statuses</option>
              {Object.values(BookingStatus).map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              name="serviceId"
              defaultValue={serviceId || ""}
              className="w-full bg-[#18181A] border border-zinc-700 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-editorial-gold text-xs"
            >
              <option value="">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex items-center">
            <Button type="submit" variant="primary" size="sm" className="w-full">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#121214] border border-zinc-800 rounded-sm overflow-hidden shadow-xl">
        {bookings.length === 0 ? (
          <div className="p-16 text-center text-xs text-zinc-500 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-zinc-600" />
            <p>No booking records found matching current criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161618] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service & Package</th>
                  <th className="p-4">Session Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Total / Balance</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 font-mono text-zinc-300 font-medium">
                      #{b.bookingReference}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{b.customer.fullName}</div>
                      <div className="text-[11px] text-zinc-500">{b.customer.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-200">{b.service.name}</div>
                      <div className="text-[11px] text-zinc-500">{b.package ? b.package.name : "Custom"}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-200">{formatDate(b.sessionDate)}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{b.startTime} (GMT)</div>
                    </td>
                    <td className="p-4">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-white">{formatCurrency(b.totalAmount)}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Rem: {formatCurrency(b.balanceRemaining)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/bookings/${b.id}`}>
                        <Button variant="secondary" size="sm" className="h-7 px-3 text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>View</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
