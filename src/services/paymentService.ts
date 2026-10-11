import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentVerificationStatus, BookingStatus } from "@prisma/client";
import { sendNotification, getPaymentReceiptEmailContent } from "@/lib/notifications";

export interface RecordPaymentInput {
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string | null;
  notes?: string | null;
  recordedBy?: string;
  verificationStatus?: PaymentVerificationStatus;
}

export async function recordPayment(input: RecordPaymentInput) {
  if (input.amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: {
      customer: true,
      payments: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  // Prevent duplicate transaction references if provided
  if (input.transactionReference && input.transactionReference.trim()) {
    const existingRef = await prisma.payment.findFirst({
      where: {
        transactionReference: input.transactionReference.trim(),
        bookingId: input.bookingId,
      },
    });
    if (existingRef) {
      throw new Error("A payment with this transaction reference has already been recorded for this booking.");
    }
  }

  const verificationStatus = input.verificationStatus ?? PaymentVerificationStatus.VERIFIED;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Payment record
    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: input.amount,
        currency: booking.currency,
        paymentMethod: input.paymentMethod,
        transactionReference: input.transactionReference?.trim() || null,
        verificationStatus,
        recordedBy: input.recordedBy || "Admin",
        notes: input.notes?.trim() || null,
      },
    });

    // 2. Recalculate verified payments total
    const allVerifiedPayments = await tx.payment.findMany({
      where: {
        bookingId: booking.id,
        verificationStatus: PaymentVerificationStatus.VERIFIED,
      },
    });

    const totalPaid = allVerifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalAgreed = Number(booking.totalAmount);
    const depositRequired = Number(booking.depositRequired);
    const balanceRemaining = Math.max(0, totalAgreed - totalPaid);

    // 3. Determine updated status
    let updatedStatus = booking.status;
    if (balanceRemaining <= 0) {
      updatedStatus = BookingStatus.FULLY_PAID;
    } else if (totalPaid >= depositRequired && booking.status !== BookingStatus.CONFIRMED) {
      updatedStatus = BookingStatus.DEPOSIT_PAID;
    }

    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        depositPaid: Math.min(depositRequired, totalPaid),
        balanceRemaining,
        status: updatedStatus,
      },
      include: { customer: true },
    });

    // 4. Record history if status changed
    if (updatedStatus !== booking.status) {
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: updatedStatus,
          changedBy: input.recordedBy || "Payment System",
          reason: `Payment of ${input.amount} ${booking.currency} recorded (${input.paymentMethod})`,
        },
      });
    }

    return { payment, updatedBooking, balanceRemaining };
  });

  // 5. Send receipt if payment verified
  if (verificationStatus === PaymentVerificationStatus.VERIFIED) {
    try {
      const email = getPaymentReceiptEmailContent({
        bookingRef: booking.bookingReference,
        customerName: booking.customer.fullName,
        amount: input.amount,
        balanceRemaining: result.balanceRemaining,
        paymentMethod: input.paymentMethod.replace(/_/g, " "),
      });

      await sendNotification({
        bookingId: booking.id,
        recipient: booking.customer.email,
        subject: email.subject,
        message: email.message,
      });
    } catch (e) {
      console.error("Non-fatal: email send failed during payment receipt:", e);
    }
  }

  return result;
}

export async function verifyPayment(paymentId: string, verified: boolean, adminName: string = "Admin") {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) throw new Error("Payment record not found.");

  const newStatus = verified ? PaymentVerificationStatus.VERIFIED : PaymentVerificationStatus.REJECTED;

  return await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: { verificationStatus: newStatus },
    });

    // Recalculate verified totals
    const allVerified = await tx.payment.findMany({
      where: {
        bookingId: payment.bookingId,
        verificationStatus: PaymentVerificationStatus.VERIFIED,
      },
    });

    const totalPaid = allVerified.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalAgreed = Number(payment.booking.totalAmount);
    const balanceRemaining = Math.max(0, totalAgreed - totalPaid);

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: {
        depositPaid: Math.min(Number(payment.booking.depositRequired), totalPaid),
        balanceRemaining,
      },
    });

    return updatedPayment;
  });
}
