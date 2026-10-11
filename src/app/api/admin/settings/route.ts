import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "primary" },
    });

    return NextResponse.json(settings);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load settings";
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

    const updated = await prisma.siteSettings.upsert({
      where: { id: "primary" },
      update: {
        businessName: body.businessName,
        tagline: body.tagline,
        bio: body.bio,
        addressOrArea: body.addressOrArea,
        phone: body.phone,
        whatsappNumber: body.whatsappNumber,
        email: body.email,
        instagramUrl: body.instagramUrl,
        facebookUrl: body.facebookUrl,
        twitterUrl: body.twitterUrl || null,
        workingHours: body.workingHours,
        bookingNoticeHours: parseInt(body.bookingNoticeHours) || 24,
        maxBookingDaysInAdvance: parseInt(body.maxBookingDaysInAdvance) || 90,
        depositPercentageDefault: parseInt(body.depositPercentageDefault) || 50,
        cancellationPolicyText: body.cancellationPolicyText,
        termsText: body.termsText,
        privacyText: body.privacyText,
        bankTransferInstructions: body.bankTransferInstructions,
        wavePaymentInstructions: body.wavePaymentInstructions,
      },
      create: {
        id: "primary",
        businessName: body.businessName || "ADU99 Photography",
        tagline: body.tagline || "Cinematic Visuals & Timeless Stories",
        bio: body.bio || "Editorial studio in The Gambia.",
        addressOrArea: body.addressOrArea || "Wellingara, Latrikunda Highway, The Gambia",
        phone: body.phone || "+220 3135947 / +220 2135552",
        whatsappNumber: body.whatsappNumber || "+2203135947",
        email: body.email || "contact@adu99photography.com",
        instagramUrl: body.instagramUrl || "https://www.instagram.com/adu_studio99/",
        facebookUrl: body.facebookUrl || "https://facebook.com",
        twitterUrl: body.twitterUrl || null,
        workingHours: body.workingHours || "Mon - Sat: 9:00 AM - 6:00 PM",
        bookingNoticeHours: parseInt(body.bookingNoticeHours) || 24,
        maxBookingDaysInAdvance: parseInt(body.maxBookingDaysInAdvance) || 90,
        depositPercentageDefault: parseInt(body.depositPercentageDefault) || 50,
        cancellationPolicyText: body.cancellationPolicyText || "",
        termsText: body.termsText || "",
        privacyText: body.privacyText || "",
        bankTransferInstructions: body.bankTransferInstructions || "",
        wavePaymentInstructions: body.wavePaymentInstructions || "",
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
