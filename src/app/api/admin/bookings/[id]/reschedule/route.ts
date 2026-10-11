import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { rescheduleBooking } from "@/services/bookingService";
import { rescheduleBookingSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminApi();
    const { id } = await params;
    const body = await request.json();

    const data = rescheduleBookingSchema.parse({ ...body, bookingId: id });

    const updated = await rescheduleBooking(
      data.bookingId,
      data.newDate,
      data.newTime,
      user.name || "Admin",
      data.reason || undefined
    );

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to reschedule booking";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
