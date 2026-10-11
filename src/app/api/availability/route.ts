import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForDate } from "@/lib/availability";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");
    const packageId = searchParams.get("packageId");

    if (!date) {
      return NextResponse.json({ error: "Date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    let durationMinutes = 60;
    let bufferMinutes = 30;

    if (packageId) {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
        include: { service: true },
      });
      if (pkg) {
        durationMinutes = pkg.durationMinutes;
        bufferMinutes = pkg.service.bufferMinutes;
      }
    } else if (serviceId) {
      const s = await prisma.service.findUnique({ where: { id: serviceId } });
      if (s) {
        durationMinutes = s.durationMinutes;
        bufferMinutes = s.bufferMinutes;
      }
    }

    const availability = await getAvailableSlotsForDate(date, durationMinutes, bufferMinutes);
    return NextResponse.json(availability);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to calculate availability";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
