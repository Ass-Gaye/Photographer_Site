import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, InquiryStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const inquiries = await prisma.inquiry.findMany({
      where: status && Object.values(InquiryStatus).includes(status as InquiryStatus)
        ? { status: status as InquiryStatus }
        : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(inquiries);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load inquiries";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, internalNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID required" }, { status: 400 });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(status ? { status: status as InquiryStatus } : {}),
        ...(internalNotes !== undefined ? { internalNotes } : {}),
      },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update inquiry";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
