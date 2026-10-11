import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { recordPayment } from "@/services/paymentService";
import { paymentRecordSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdminApi();
    const { id } = await params;
    const body = await request.json();

    const data = paymentRecordSchema.parse({ ...body, bookingId: id });

    const result = await recordPayment({
      bookingId: data.bookingId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference,
      notes: data.notes,
      recordedBy: user.name || "Admin",
      verificationStatus: data.verificationStatus,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
