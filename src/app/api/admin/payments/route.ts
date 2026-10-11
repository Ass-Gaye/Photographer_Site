import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, PaymentVerificationStatus, PaymentMethod } from "@prisma/client";
import { recordPayment } from "@/services/paymentService";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const payments = await prisma.payment.findMany({
      where: status && Object.values(PaymentVerificationStatus).includes(status as PaymentVerificationStatus)
        ? { verificationStatus: status as PaymentVerificationStatus }
        : {},
      include: {
        booking: {
          include: { customer: true, service: true },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load payments";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, amount, paymentMethod, transactionReference, notes, verificationStatus } = body;

    const payment = await recordPayment({
      bookingId,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod as PaymentMethod,
      transactionReference,
      notes,
      recordedBy: user.name || "Admin",
      verificationStatus: verificationStatus as PaymentVerificationStatus,
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Payment record failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, verificationStatus } = body;

    if (!paymentId || !verificationStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { verificationStatus: verificationStatus as PaymentVerificationStatus },
    });

    return NextResponse.json({ success: true, payment: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update payment status";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
