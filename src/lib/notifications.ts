import { prisma } from "./prisma";
import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { formatCurrency, formatDate } from "./utils";

interface SendNotificationOptions {
  bookingId?: string;
  recipient: string;
  subject: string;
  message: string;
  channel?: NotificationChannel;
}

export async function sendNotification({
  bookingId,
  recipient,
  subject,
  message,
  channel = NotificationChannel.EMAIL,
}: SendNotificationOptions) {
  let status: NotificationStatus = NotificationStatus.SIMULATED;
  let errorMessage: string | null = null;

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && channel === NotificationChannel.EMAIL) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);
      const from = process.env.EMAIL_FROM || "ADU99 Photography <bookings@adu99photography.com>";

      const res = await resend.emails.send({
        from,
        to: recipient,
        subject,
        text: message,
      });

      if (res.error) {
        status = NotificationStatus.FAILED;
        errorMessage = res.error.message;
      } else {
        status = NotificationStatus.SENT;
      }
    } else {
      // In development or when external API keys aren't configured yet,
      // log to server console and record as SIMULATED
      console.log(`[Notification ${channel} to ${recipient}]: ${subject}\n${message}`);
      status = NotificationStatus.SIMULATED;
    }
  } catch (err: unknown) {
    status = NotificationStatus.FAILED;
    errorMessage = err instanceof Error ? err.message : "Unknown notification error";
    console.error("Failed to deliver notification:", err);
  }

  // Persist attempt log in database for admin visibility
  try {
    await prisma.notificationLog.create({
      data: {
        bookingId: bookingId || null,
        recipient,
        channel,
        subject,
        message,
        status,
        error: errorMessage,
      },
    });
  } catch (logErr) {
    console.error("Failed to write notification log:", logErr);
  }

  return { success: status !== NotificationStatus.FAILED, status, error: errorMessage };
}

// Notification Templates
export function getBookingReceivedEmailContent(data: {
  bookingRef: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  totalAmount: number;
  depositRequired: number;
}) {
  const subject = `Booking Request Received: #${data.bookingRef} – ADU99 Photography`;
  const message = `Dear ${data.customerName},

Thank you for your booking request with ADU99 Photography.

Booking Reference: #${data.bookingRef}
Service: ${data.serviceName}
Scheduled Date: ${data.date}
Scheduled Time: ${data.time}
Total Estimated Amount: ${formatCurrency(data.totalAmount)}
Deposit Required (Upon Confirmation): ${formatCurrency(data.depositRequired)}

Status: PENDING CONFIRMATION
Our studio is reviewing your requested date and time. Once confirmed, we will send you approved payment instructions for your deposit.

You can also follow up directly with us on WhatsApp if you have urgent questions.

Warm regards,
ADU99 Photography Team
Banjul, The Gambia
`;
  return { subject, message };
}

export function getBookingConfirmedEmailContent(data: {
  bookingRef: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  venue: string;
  depositRequired: number;
}) {
  const subject = `Booking Confirmed: #${data.bookingRef} – ADU99 Photography`;
  const message = `Dear ${data.customerName},

Great news! Your booking with ADU99 Photography has been approved and confirmed on our schedule.

Booking Reference: #${data.bookingRef}
Service: ${data.serviceName}
Date: ${data.date}
Time: ${data.time}
Location/Venue: ${data.venue}

Deposit Due: ${formatCurrency(data.depositRequired)}
Please settle your deposit via Wave (+220 3135947) or Ecobank bank transfer quoting your booking reference #${data.bookingRef} to secure your time slot.

We look forward to capturing your timeless moments!

Warm regards,
ADU99 Photography Team
`;
  return { subject, message };
}

export function getPaymentReceiptEmailContent(data: {
  bookingRef: string;
  customerName: string;
  amount: number;
  balanceRemaining: number;
  paymentMethod: string;
}) {
  const subject = `Payment Received: #${data.bookingRef} – ADU99 Photography`;
  const message = `Dear ${data.customerName},

We have verified your payment of ${formatCurrency(data.amount)} via ${data.paymentMethod} for booking #${data.bookingRef}.

Remaining Balance: ${formatCurrency(data.balanceRemaining)}

Thank you for your business.

Warm regards,
ADU99 Photography Team
`;
  return { subject, message };
}
