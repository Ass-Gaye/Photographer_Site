import { NextRequest, NextResponse } from "next/server";
import { createInquiry } from "@/services/inquiryService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inquiry = await createInquiry(body);
    return NextResponse.json({ success: true, inquiryId: inquiry.id });
  } catch (error: unknown) {
    console.error("Contact inquiry submission error:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit inquiry";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
