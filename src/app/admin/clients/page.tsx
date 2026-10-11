import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { BookingStatusBadge } from "@/components/ui/StatusBadge";
import { Users, Phone, Mail, Calendar, MessageCircle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminClientsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminClientsPage({ searchParams }: AdminClientsPageProps) {
  await requireAdmin();
  const { q } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: q && q.trim()
      ? {
          OR: [
            { fullName: { contains: q.trim(), mode: "insensitive" } },
            { email: { contains: q.trim(), mode: "insensitive" } },
            { phone: { contains: q.trim(), mode: "insensitive" } },
          ],
        }
      : {},
    include: {
      bookings: {
        include: { service: true, package: true },
        orderBy: { sessionDate: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium">
            Client Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Overview of client profiles, past sessions, lifetime bookings, and direct contact details.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#121214] border border-zinc-800 p-4 rounded-sm">
        <form method="GET" action="/admin/clients" className="max-w-md">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search by name, email, or phone number..."
            className="w-full bg-[#18181A] border border-zinc-700 rounded-sm px-3.5 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-editorial-gold text-xs"
          />
        </form>
      </div>

      {/* Clients Grid */}
      <div className="space-y-4">
        {customers.length === 0 ? (
          <div className="p-12 text-center bg-[#121214] border border-zinc-800 rounded-sm text-zinc-500 text-xs">
            No client records found.
          </div>
        ) : (
          customers.map((cust) => {
            const totalSpent = cust.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
            return (
              <div
                key={cust.id}
                className="bg-[#121214] border border-zinc-800 p-6 rounded-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-editorial-gold font-medium text-xs">
                      {cust.fullName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-serif text-white font-medium">{cust.fullName}</h2>
                      <span className="text-[10px] text-zinc-500">Client since {formatDate(cust.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs">
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Bookings</span>
                      <strong className="text-white">{cust.bookings.length}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Lifetime Value</span>
                      <strong className="text-editorial-gold">{formatCurrency(totalSpent)}</strong>
                    </div>
                    <a
                      href={buildWhatsAppLink(
                        cust.phone,
                        `Hello ${cust.fullName}, following up from ADU99 Photography.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-xs px-3 py-1.5 rounded-sm transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <Mail className="w-3.5 h-3.5 text-editorial-gold shrink-0" />
                    <a href={`mailto:${cust.email}`} className="hover:text-white truncate">
                      {cust.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <Phone className="w-3.5 h-3.5 text-editorial-gold shrink-0" />
                    <a href={`tel:${cust.phone}`} className="hover:text-white">
                      {cust.phone}
                    </a>
                  </div>
                </div>

                {/* Booking History Snippet */}
                {cust.bookings.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-2 font-medium">
                      Booking History
                    </span>
                    <div className="divide-y divide-zinc-800/60 bg-zinc-950/60 border border-zinc-800/60 rounded-sm">
                      {cust.bookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-zinc-400 text-[11px]">#{b.bookingReference}</span>
                            <span className="text-white">{b.service.name}</span>
                            <span className="text-zinc-500">• {formatDate(b.sessionDate)} at {b.startTime}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <BookingStatusBadge status={b.status} />
                            <Link
                              href={`/admin/bookings/${b.id}`}
                              className="text-editorial-gold hover:underline text-[11px] inline-flex items-center"
                            >
                              <span>Manage</span>
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
