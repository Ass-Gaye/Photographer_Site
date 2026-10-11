import { z } from "zod";

export const bookingSubmissionSchema = z.object({
  serviceId: z.string().min(1, "Service selection is required"),
  packageId: z.string().optional().nullable(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format (HH:MM)"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(7, "Please provide a valid telephone or WhatsApp number"),
  sessionType: z.string().default("Standard"),
  locationVenue: z.string().min(2, "Session location or venue is required"),
  participantsCount: z.coerce.number().min(1).default(1),
  notes: z.string().max(1000).optional().nullable(),
  referralSource: z.string().optional().nullable(),
  addOnIds: z.array(z.string()).default([]),
  acceptTerms: z.literal(true, {
    message: "You must accept the booking and cancellation policy",
  }),
});

export type BookingSubmissionInput = z.infer<typeof bookingSubmissionSchema>;

export const inquirySubmissionSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone or WhatsApp number required"),
  serviceInterested: z.string().optional().nullable(),
  preferredDate: z.string().optional().nullable(),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export type InquirySubmissionInput = z.infer<typeof inquirySubmissionSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const paymentRecordSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY_WAVE", "ONLINE_CARD", "OTHER"]),
  transactionReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  verificationStatus: z.enum(["PENDING_VERIFICATION", "VERIFIED", "REJECTED"]).default("VERIFIED"),
});

export const rescheduleBookingSchema = z.object({
  bookingId: z.string().min(1),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  newTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format"),
  reason: z.string().optional().nullable(),
});

export const statusChangeSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum([
    "PENDING_CONFIRMATION",
    "CONFIRMED",
    "AWAITING_DEPOSIT",
    "DEPOSIT_PAID",
    "FULLY_PAID",
    "COMPLETED",
    "CANCELLED",
    "RESCHEDULE_REQUESTED",
    "DECLINED",
  ]),
  reason: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});
