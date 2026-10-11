import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { bookingSubmissionSchema, BookingSubmissionInput } from "@/lib/validations";
import { generateBookingReference, minutesToTimeString, timeStringToMinutes } from "@/lib/utils";
import { isSlotAvailable } from "@/lib/availability";
import { sendNotification, getBookingReceivedEmailContent, getBookingConfirmedEmailContent } from "@/lib/notifications";

export async function createBookingRequest(rawInput: BookingSubmissionInput) {
  const data = bookingSubmissionSchema.parse(rawInput);

  // 1. Fetch service and optional package
  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
    include: { packages: true, addOns: true },
  });

  if (!service || !service.isActive) {
    throw new Error("Selected service is currently unavailable.");
  }

  const selectedPackage = data.packageId
    ? service.packages.find((p) => p.id === data.packageId)
    : null;

  // Compute session duration
  const durationMinutes = selectedPackage ? selectedPackage.durationMinutes : service.durationMinutes;
  const startMinutes = timeStringToMinutes(data.startTime);
  const endTime = minutesToTimeString(startMinutes + durationMinutes);

  // 2. Validate availability on server
  const availability = await isSlotAvailable(
    data.sessionDate,
    data.startTime,
    durationMinutes,
    service.bufferMinutes
  );

  if (!availability.available) {
    throw new Error(availability.reason || "The selected date or time slot is not available.");
  }

  // 3. Price Snapshot computation
  const settings = await prisma.siteSettings.findUnique({ where: { id: "primary" } });
  const depositPct = settings?.depositPercentageDefault ?? 50;

  const basePrice = selectedPackage
    ? Number(selectedPackage.price)
    : Number(service.startingPrice);

  // Selected Add-ons
  const selectedAddOns = (data.addOnIds || [])
    .map((id) => service.addOns.find((a) => a.id === id))
    .filter(Boolean) as (typeof service.addOns)[0][];

  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + Number(item.price), 0);
  const totalAmount = basePrice + addOnsTotal;

  const depositRequired = selectedPackage && Number(selectedPackage.depositAmount) > 0
    ? Number(selectedPackage.depositAmount)
    : Math.round((totalAmount * depositPct) / 100);

  const balanceRemaining = totalAmount; // initial balance before deposit payment

  // 4. Booking reference
  const bookingReference = generateBookingReference();

  // 5. Database transaction: Customer + Booking + AddOns + StatusHistory
  const result = await prisma.$transaction(async (tx) => {
    // Upsert Customer
    const customer = await tx.customer.upsert({
      where: { email: data.email.toLowerCase().trim() },
      update: {
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
      },
      create: {
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
      },
    });

    const booking = await tx.booking.create({
      data: {
        bookingReference,
        customerId: customer.id,
        serviceId: service.id,
        packageId: selectedPackage ? selectedPackage.id : null,
        sessionDate: new Date(`${data.sessionDate}T00:00:00.000Z`),
        startTime: data.startTime,
        endTime,
        sessionType: data.sessionType || (selectedPackage ? selectedPackage.name : service.name),
        locationVenue: data.locationVenue,
        participantsCount: data.participantsCount,
        notes: data.notes || null,
        referralSource: data.referralSource || null,
        status: BookingStatus.PENDING_CONFIRMATION,
        basePrice,
        addOnsTotal,
        totalAmount,
        depositRequired,
        depositPaid: 0,
        balanceRemaining,
        currency: service.currency || "GMD",
        termsAcceptedAt: new Date(),
        addOns: {
          create: selectedAddOns.map((addon) => ({
            addOnId: addon.id,
            name: addon.name,
            price: Number(addon.price),
            quantity: 1,
          })),
        },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: BookingStatus.PENDING_CONFIRMATION,
            changedBy: "Customer (Online Request)",
            reason: "Initial booking submission",
          },
        },
      },
      include: {
        customer: true,
        service: true,
        package: true,
        addOns: true,
      },
    });

    return booking;
  });

  // 6. Asynchronous Notification (email + logging)
  try {
    const emailData = getBookingReceivedEmailContent({
      bookingRef: result.bookingReference,
      customerName: result.customer.fullName,
      serviceName: result.service.name,
      date: data.sessionDate,
      time: data.startTime,
      totalAmount,
      depositRequired,
    });

    await sendNotification({
      bookingId: result.id,
      recipient: result.customer.email,
      subject: emailData.subject,
      message: emailData.message,
    });
  } catch (notifyErr) {
    console.error("Non-fatal: email send failed during booking creation:", notifyErr);
  }

  return result;
}

/**
 * Secure customer lookup: requires booking reference AND either matching email or matching phone
 */
export async function lookupBooking(bookingReference: string, identifier: string) {
  const cleanRef = bookingReference.trim().toUpperCase();
  const cleanId = identifier.trim().toLowerCase();

  const booking = await prisma.booking.findUnique({
    where: { bookingReference: cleanRef },
    include: {
      customer: true,
      service: true,
      package: true,
      addOns: true,
      payments: {
        orderBy: { paymentDate: "desc" },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!booking) return null;

  // Security check: verify identifier matches customer email or sanitized phone
  const customerEmail = booking.customer.email.toLowerCase();
  const customerPhoneClean = booking.customer.phone.replace(/[^0-9]/g, "");
  const inputClean = cleanId.replace(/[^0-9]/g, "");

  const emailMatches = customerEmail === cleanId;
  const phoneMatches = inputClean.length >= 7 && customerPhoneClean.includes(inputClean);

  if (!emailMatches && !phoneMatches) {
    return null;
  }

  return booking;
}

/**
 * Admin action to change booking status with conflict re-checking
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  changedBy: string = "Admin",
  reason?: string
) {
  const current = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, service: true },
  });

  if (!current) throw new Error("Booking not found");

  // If transitioning to CONFIRMED or DEPOSIT_PAID, verify that no other confirmed booking overlaps
  if (newStatus === BookingStatus.CONFIRMED || newStatus === BookingStatus.DEPOSIT_PAID) {
    const dateStr = current.sessionDate.toISOString().split("T")[0];
    const durationMinutes = timeStringToMinutes(current.endTime) - timeStringToMinutes(current.startTime);
    const check = await isSlotAvailable(
      dateStr,
      current.startTime,
      durationMinutes,
      current.service.bufferMinutes,
      current.id
    );

    if (!check.available) {
      throw new Error(`Cannot confirm: ${check.reason}`);
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        cancellationReason: newStatus === BookingStatus.CANCELLED ? reason : current.cancellationReason,
      },
      include: { customer: true, service: true, package: true },
    });

    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        fromStatus: current.status,
        toStatus: newStatus,
        changedBy,
        reason: reason || `Status changed from ${current.status} to ${newStatus}`,
      },
    });

    return b;
  });

  // Notify client if confirmed
  if (newStatus === BookingStatus.CONFIRMED) {
    try {
      const email = getBookingConfirmedEmailContent({
        bookingRef: updated.bookingReference,
        customerName: updated.customer.fullName,
        serviceName: updated.service.name,
        date: updated.sessionDate.toISOString().split("T")[0],
        time: updated.startTime,
        venue: updated.locationVenue,
        depositRequired: Number(updated.depositRequired),
      });

      await sendNotification({
        bookingId: updated.id,
        recipient: updated.customer.email,
        subject: email.subject,
        message: email.message,
      });
    } catch (e) {
      console.error("Non-fatal: email send failed during confirmation:", e);
    }
  }

  return updated;
}

/**
 * Reschedule booking to a new date and time with validation
 */
export async function rescheduleBooking(
  bookingId: string,
  newDateStr: string,
  newStartTime: string,
  changedBy: string = "Admin",
  reason?: string
) {
  const current = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, customer: true },
  });

  if (!current) throw new Error("Booking not found");

  const durationMinutes = timeStringToMinutes(current.endTime) - timeStringToMinutes(current.startTime);
  const newEndTime = minutesToTimeString(timeStringToMinutes(newStartTime) + durationMinutes);

  // Validate availability for the new time slot
  const check = await isSlotAvailable(
    newDateStr,
    newStartTime,
    durationMinutes,
    current.service.bufferMinutes,
    current.id
  );

  if (!check.available) {
    throw new Error(check.reason || "The requested reschedule slot is unavailable.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: bookingId },
      data: {
        sessionDate: new Date(`${newDateStr}T00:00:00.000Z`),
        startTime: newStartTime,
        endTime: newEndTime,
        rescheduleDate: new Date(`${newDateStr}T00:00:00.000Z`),
        rescheduleTime: newStartTime,
      },
      include: { customer: true, service: true },
    });

    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        fromStatus: current.status,
        toStatus: current.status,
        changedBy,
        reason: `Rescheduled to ${newDateStr} at ${newStartTime}. ${reason || ""}`.trim(),
      },
    });

    return b;
  });

  return updated;
}
