import { NextRequest, NextResponse } from "next/server";
import { createBookingRequest } from "@/services/bookingService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createBookingRequest(body);

    return NextResponse.json({
      success: true,
      bookingReference: result.bookingReference,
      bookingId: result.id,
      customerName: result.customer.fullName,
      serviceName: result.service.name,
      sessionDate: result.sessionDate,
      startTime: result.startTime,
      totalAmount: result.totalAmount,
      depositRequired: result.depositRequired,
      currency: result.currency,
      status: result.status,
    });
  } catch (error: unknown) {
    console.error("Booking submission error:", error);
    const msg = error instanceof Error ? error.message : "Failed to process booking request";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
