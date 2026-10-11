import React from "react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PaymentsManager } from "@/components/admin/PaymentsManager";
import { DollarSign, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { PaymentVerificationStatus, BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const [payments, verifiedPayments, activeBookings] = await Promise.all([
    prisma.payment.findMany({
      include: {
        booking: {
          include: { customer: true, service: true },
        },
      },
      orderBy: { paymentDate: "desc" },
    }),
    prisma.payment.findMany({
      where: { verificationStatus: PaymentVerificationStatus.VERIFIED },
      select: { amount: true },
    }),
    prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.DEPOSIT_PAID, BookingStatus.PENDING_CONFIRMATION],
        },
      },
      select: { balanceRemaining: true, depositRequired: true, depositPaid: true },
    }),
  ]);

  const totalVerifiedRevenue = verifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOutstandingBalance = activeBookings.reduce((sum, b) => sum + Number(b.balanceRemaining), 0);
  const totalDepositsCollected = activeBookings.reduce((sum, b) => sum + Number(b.depositPaid), 0);

  const pendingVerificationCount = payments.filter(
    (p) => p.verificationStatus === PaymentVerificationStatus.PENDING_VERIFICATION
  ).length;

  return (
    <div className="space-y-8 font-sans">
      <div>
        <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
          Finance & Accounting
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-white font-medium">
          Payments & Revenue Ledger
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Track verified Dalasi deposits, bank transfers, Wave receipts, and remaining customer balances.
        </p>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121214] border border-zinc-800 p-5 rounded-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-medium">Total Revenue Verified</span>
            <DollarSign className="w-4 h-4 text-editorial-gold" />
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {formatCurrency(totalVerifiedRevenue)}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Cleared studio income</span>
        </div>

        <div className="bg-[#121214] border border-zinc-800 p-5 rounded-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-medium">Outstanding Balances</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-serif text-amber-300 font-medium">
            {formatCurrency(totalOutstandingBalance)}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Due upon shoot delivery</span>
        </div>

        <div className="bg-[#121214] border border-zinc-800 p-5 rounded-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-medium">Deposits Held</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif text-emerald-300 font-medium">
            {formatCurrency(totalDepositsCollected)}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Securing active bookings</span>
        </div>

        <div className="bg-[#121214] border border-zinc-800 p-5 rounded-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-medium">Pending Verification</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-serif text-blue-300 font-medium">
            {pendingVerificationCount}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Wave/Bank receipts to verify</span>
        </div>
      </div>

      {/* Ledger Table */}
      <PaymentsManager initialPayments={payments} />
    </div>
  );
}
