"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { BookingStatus, PaymentMethod } from "@prisma/client";
import { Check, X, Calendar, DollarSign, MessageCircle, AlertTriangle } from "lucide-react";
import { buildWhatsAppLink, getAdminClientFollowUpWhatsAppMessage } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";

interface BookingDetailActionsProps {
  bookingId: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  sessionDateStr: string;
  currentStatus: BookingStatus;
  depositRequired: number;
  balanceRemaining: number;
  currency: string;
}

export function BookingDetailActions({
  bookingId,
  bookingRef,
  customerName,
  customerPhone,
  sessionDateStr,
  currentStatus,
  depositRequired,
  balanceRemaining,
  currency,
}: BookingDetailActionsProps) {
  const router = useRouter();

  // Modals state
  const [activeModal, setActiveModal] = useState<"confirm" | "decline" | "cancel" | "reschedule" | "payment" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form states
  const [reason, setReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Payment form states
  const [paymentAmount, setPaymentAmount] = useState<string>(depositRequired > 0 ? depositRequired.toString() : "1000");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.MOBILE_MONEY_WAVE);
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const handleStatusChange = async (newStatus: BookingStatus) => {
    setIsLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reason: reason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      setActiveModal(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      setActionError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async () => {
    setIsLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDate,
          newTime,
          reason: reason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reschedule booking");
      }

      setActiveModal(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error rescheduling booking";
      setActionError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    setIsLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          paymentMethod,
          transactionReference: transactionRef || undefined,
          notes: paymentNotes || undefined,
          verificationStatus: "VERIFIED",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record payment");
      }

      setActiveModal(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error recording payment";
      setActionError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // WhatsApp link to client
  const clientWhatsAppHref = buildWhatsAppLink(
    customerPhone,
    getAdminClientFollowUpWhatsAppMessage(customerName, bookingRef, sessionDateStr)
  );

  return (
    <div className="space-y-4">
      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3">
        {currentStatus === BookingStatus.PENDING_CONFIRMATION && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setActiveModal("confirm");
              setActionError(null);
            }}
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            <span>Confirm Booking</span>
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setActiveModal("payment");
            setActionError(null);
          }}
        >
          <DollarSign className="w-3.5 h-3.5 mr-1.5" />
          <span>Record Payment</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setActiveModal("reschedule");
            setActionError(null);
          }}
        >
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          <span>Reschedule Slot</span>
        </Button>

        <a href={clientWhatsAppHref} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="sm" className="text-emerald-400 hover:text-emerald-300">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            <span>WhatsApp Client</span>
          </Button>
        </a>

        {currentStatus !== BookingStatus.CANCELLED && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setActiveModal("cancel");
              setActionError(null);
            }}
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            <span>Cancel Session</span>
          </Button>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {activeModal === "confirm" && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-800 rounded-sm p-6 max-w-md w-full space-y-4 animate-scale-in">
            <h3 className="font-serif text-lg text-white font-medium">Confirm Booking Session</h3>
            <p className="text-xs text-zinc-400">
              Confirming this booking verifies that no other sessions overlap on {sessionDateStr}. An automated approval email with deposit instructions will be issued.
            </p>
            {actionError && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300 rounded-sm">
                {actionError}
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange(BookingStatus.CONFIRMED)}
                isLoading={isLoading}
              >
                Approve & Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {activeModal === "cancel" && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-800 rounded-sm p-6 max-w-md w-full space-y-4 animate-scale-in">
            <h3 className="font-serif text-lg text-red-400 font-medium">Cancel Booking</h3>
            <p className="text-xs text-zinc-400">
              This will release the time slot on the studio calendar. Please record the cancellation reason.
            </p>
            <Textarea
              label="Cancellation Reason"
              placeholder="e.g. Client requested cancellation due to scheduling conflict..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {actionError && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300 rounded-sm">
                {actionError}
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading}>
                Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleStatusChange(BookingStatus.CANCELLED)}
                isLoading={isLoading}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {activeModal === "reschedule" && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-800 rounded-sm p-6 max-w-md w-full space-y-4 animate-scale-in">
            <h3 className="font-serif text-lg text-white font-medium">Reschedule Session Slot</h3>
            <div className="space-y-3">
              <Input
                label="New Date"
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <Input
                label="New Start Time (HH:MM)"
                type="text"
                placeholder="10:00"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
              <Input
                label="Reason for Rescheduling"
                placeholder="Client request / Weather adjustment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            {actionError && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300 rounded-sm">
                {actionError}
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleReschedule}
                isLoading={isLoading}
                disabled={!newDate || !newTime}
              >
                Verify & Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {activeModal === "payment" && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-800 rounded-sm p-6 max-w-md w-full space-y-4 animate-scale-in">
            <h3 className="font-serif text-lg text-white font-medium">Record Payment Ledger Entry</h3>
            <div className="space-y-3 text-xs">
              <Input
                label={`Amount Paid (${currency})`}
                type="number"
                min={1}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-medium text-zinc-400">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#18181A] border border-zinc-700 rounded-sm px-3.5 py-2 text-white focus:outline-none focus:border-editorial-gold"
                >
                  <option value={PaymentMethod.MOBILE_MONEY_WAVE}>Wave Mobile Money</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer (Ecobank)</option>
                  <option value={PaymentMethod.CASH}>In-Studio Cash</option>
                  <option value={PaymentMethod.ONLINE_CARD}>Card / Online Payment</option>
                  <option value={PaymentMethod.OTHER}>Other Method</option>
                </select>
              </div>
              <Input
                label="Transaction / Transfer Reference"
                placeholder="e.g. WAVE-GM-123456 or Bank Ref"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
              <Input
                label="Internal Ledger Notes"
                placeholder="e.g. Received 50% deposit via Wave"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
            {actionError && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300 rounded-sm">
                {actionError}
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRecordPayment}
                isLoading={isLoading}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                Save & Verify Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
