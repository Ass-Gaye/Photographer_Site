"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { CreditCard, CheckCircle2, XCircle, ArrowRight, DollarSign } from "lucide-react";
import { PaymentMethod, PaymentVerificationStatus } from "@prisma/client";

interface PaymentWithBooking {
  id: string;
  bookingId: string;
  amount: number | string | { toString(): string };
  currency: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string | null;
  paymentDate: Date | string;
  verificationStatus: PaymentVerificationStatus;
  recordedBy: string;
  notes?: string | null;
  booking: {
    bookingReference: string;
    totalAmount: number | string | { toString(): string };
    balanceRemaining: number | string | { toString(): string };
    customer: {
      fullName: string;
      email: string;
      phone: string;
    };
    service: {
      name: string;
    };
  };
}

export function PaymentsManager({ initialPayments }: { initialPayments: PaymentWithBooking[] }) {
  const [payments, setPayments] = useState<PaymentWithBooking[]>(initialPayments);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (paymentId: string, newStatus: PaymentVerificationStatus) => {
    setUpdatingId(paymentId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, verificationStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, verificationStatus: newStatus } : p))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#121214] border border-zinc-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161618] border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-medium">Date</th>
                <th className="py-3.5 px-4 font-medium">Booking</th>
                <th className="py-3.5 px-4 font-medium">Client</th>
                <th className="py-3.5 px-4 font-medium">Method</th>
                <th className="py-3.5 px-4 font-medium">Reference</th>
                <th className="py-3.5 px-4 font-medium">Amount</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/bookings/${p.bookingId}`}
                        className="font-mono text-editorial-gold hover:underline"
                      >
                        #{p.booking.bookingReference}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white block font-medium">{p.booking.customer.fullName}</span>
                      <span className="text-zinc-500 text-[10px]">{p.booking.service.name}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono">
                        {p.paymentMethod.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                      {p.transactionReference || "—"}
                    </td>
                    <td className="py-3 px-4 font-serif text-white text-sm font-medium">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <PaymentStatusBadge status={p.verificationStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {p.verificationStatus === "PENDING_VERIFICATION" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(p.id, "VERIFIED")}
                              disabled={updatingId === p.id}
                              title="Verify Payment"
                              className="text-emerald-400 hover:text-emerald-300 p-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(p.id, "REJECTED")}
                              disabled={updatingId === p.id}
                              title="Reject Payment"
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <Link
                          href={`/admin/bookings/${p.bookingId}`}
                          className="text-zinc-400 hover:text-white p-1"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
