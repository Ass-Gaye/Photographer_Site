import { prisma } from "./prisma";
import { BookingStatus } from "@prisma/client";
import { timeStringToMinutes, minutesToTimeString } from "./utils";

export interface TimeSlot {
  time: string; // e.g. "10:00"
  endTime: string; // e.g. "11:00"
  available: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string; // "YYYY-MM-DD"
  isWorkingDay: boolean;
  slots: TimeSlot[];
}

// Statuses that actually hold and block the calendar
export const BLOCKING_STATUSES: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.DEPOSIT_PAID,
  BookingStatus.FULLY_PAID,
];

/**
 * Checks if a specific date and time slot is available
 */
export async function isSlotAvailable(
  dateStr: string,
  startTimeStr: string,
  durationMinutes: number,
  bufferMinutes: number = 30,
  excludeBookingId?: string
): Promise<{ available: boolean; reason?: string }> {
  const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
  const dayOfWeek = targetDate.getUTCDay();

  // 1. Fetch site settings
  const settings = await prisma.siteSettings.findUnique({ where: { id: "primary" } });
  const noticeHours = settings?.bookingNoticeHours ?? 24;
  const maxDays = settings?.maxBookingDaysInAdvance ?? 90;

  const now = new Date();
  const [hours, mins] = startTimeStr.split(":").map(Number);
  const slotStartDateTime = new Date(`${dateStr}T${startTimeStr}:00.000Z`);

  // Notice hours check
  const diffHours = (slotStartDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours < noticeHours) {
    return { available: false, reason: `Requires at least ${noticeHours} hours advance notice.` };
  }

  // Max days check
  const diffDays = (slotStartDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > maxDays) {
    return { available: false, reason: `Bookings are only accepted up to ${maxDays} days in advance.` };
  }

  // 2. Fetch Availability rule for dayOfWeek
  const rule = await prisma.availabilityRule.findUnique({
    where: { dayOfWeek },
  });

  if (!rule || !rule.isActive) {
    return { available: false, reason: "Studio is closed on this day." };
  }

  const requestedStart = timeStringToMinutes(startTimeStr);
  const requestedEnd = requestedStart + durationMinutes;

  const ruleStart = timeStringToMinutes(rule.startTime);
  const ruleEnd = timeStringToMinutes(rule.endTime);

  if (requestedStart < ruleStart || requestedEnd > ruleEnd) {
    return {
      available: false,
      reason: `Operating hours are between ${rule.startTime} and ${rule.endTime}.`,
    };
  }

  // 3. Blocked time exceptions
  const blockedDates = await prisma.blockedTime.findMany({
    where: {
      startDate: { lte: slotStartDateTime },
      endDate: { gte: slotStartDateTime },
    },
  });

  if (blockedDates.length > 0) {
    return { available: false, reason: "Date is blocked on the studio schedule." };
  }

  // 4. Overlapping confirmed sessions
  // Fetch existing confirmed bookings for this date
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

  const existingBookings = await prisma.booking.findMany({
    where: {
      sessionDate: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        in: BLOCKING_STATUSES,
      },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
    },
  });

  for (const b of existingBookings) {
    const existingStart = timeStringToMinutes(b.startTime);
    // Buffer time is added to prevent back-to-back overlap
    const existingEnd = timeStringToMinutes(b.endTime) + bufferMinutes;
    const requestedEndWithBuffer = requestedEnd + bufferMinutes;

    // Check interval overlap: startA < endB && endA > startB
    if (requestedStart < existingEnd && requestedEndWithBuffer > existingStart) {
      return { available: false, reason: "This time slot is already reserved by a confirmed session." };
    }
  }

  return { available: true };
}

/**
 * Computes all available slots for a given date
 */
export async function getAvailableSlotsForDate(
  dateStr: string,
  durationMinutes: number = 60,
  bufferMinutes: number = 30
): Promise<DayAvailability> {
  const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
  const dayOfWeek = targetDate.getUTCDay();

  const rule = await prisma.availabilityRule.findUnique({
    where: { dayOfWeek },
  });

  if (!rule || !rule.isActive) {
    return {
      date: dateStr,
      isWorkingDay: false,
      slots: [],
    };
  }

  const ruleStart = timeStringToMinutes(rule.startTime);
  const ruleEnd = timeStringToMinutes(rule.endTime);
  const slotInterval = 60; // Offer slots on the hour

  const slots: TimeSlot[] = [];

  for (let m = ruleStart; m + durationMinutes <= ruleEnd; m += slotInterval) {
    const startTimeStr = minutesToTimeString(m);
    const endTimeStr = minutesToTimeString(m + durationMinutes);

    const check = await isSlotAvailable(dateStr, startTimeStr, durationMinutes, bufferMinutes);

    slots.push({
      time: startTimeStr,
      endTime: endTimeStr,
      available: check.available,
      reason: check.reason,
    });
  }

  return {
    date: dateStr,
    isWorkingDay: true,
    slots,
  };
}
