import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    await requireAdminApi();
    const body = await request.json();

    const { action } = body;

    if (action === "update-rule") {
      const { dayOfWeek, isActive, startTime, endTime } = body;
      const updated = await prisma.availabilityRule.upsert({
        where: { dayOfWeek: parseInt(dayOfWeek) },
        update: { isActive: Boolean(isActive), startTime, endTime },
        create: {
          dayOfWeek: parseInt(dayOfWeek),
          isActive: Boolean(isActive),
          startTime,
          endTime,
          slotDurationMinutes: 60,
          bufferMinutes: 30,
        },
      });
      return NextResponse.json({ success: true, rule: updated });
    }

    if (action === "block-date") {
      const { startDate, endDate, reason } = body;
      const blocked = await prisma.blockedTime.create({
        data: {
          startDate: new Date(`${startDate}T00:00:00.000Z`),
          endDate: new Date(`${endDate || startDate}T23:59:59.999Z`),
          reason: reason || "Studio Blocked / Holiday",
          allDay: true,
        },
      });
      return NextResponse.json({ success: true, blocked });
    }

    if (action === "delete-block") {
      const { id } = body;
      await prisma.blockedTime.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Availability operation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
