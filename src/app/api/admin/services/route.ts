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

    const services = await prisma.service.findMany({
      include: {
        packages: { orderBy: { sortOrder: "asc" } },
        addOns: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(services);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load services";
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
    const { action } = body;

    if (action === "toggle-service-active") {
      const { id, isActive } = body;
      const updated = await prisma.service.update({
        where: { id },
        data: { isActive },
      });
      return NextResponse.json({ success: true, service: updated });
    }

    if (action === "toggle-package-active") {
      const { id, isActive } = body;
      const updated = await prisma.package.update({
        where: { id },
        data: { isActive },
      });
      return NextResponse.json({ success: true, package: updated });
    }

    if (action === "update-service") {
      const { id, name, description, durationMinutes, bufferMinutes, startingPrice, coverImage } = body;
      const updated = await prisma.service.update({
        where: { id },
        data: {
          name,
          description,
          durationMinutes: parseInt(durationMinutes),
          bufferMinutes: parseInt(bufferMinutes),
          startingPrice: parseFloat(startingPrice),
          coverImage,
        },
      });
      return NextResponse.json({ success: true, service: updated });
    }

    if (action === "update-package") {
      const { id, name, price, depositAmount, durationMinutes, editedPhotosCount, deliverables, isFeatured } = body;
      const updated = await prisma.package.update({
        where: { id },
        data: {
          name,
          price: parseFloat(price),
          depositAmount: parseFloat(depositAmount || "0"),
          durationMinutes: parseInt(durationMinutes),
          editedPhotosCount: parseInt(editedPhotosCount),
          deliverables,
          isFeatured: Boolean(isFeatured),
        },
      });
      return NextResponse.json({ success: true, package: updated });
    }

    if (action === "create-package") {
      const { serviceId, name, slug, price, depositAmount, durationMinutes, editedPhotosCount, deliverables, isFeatured } = body;
      const created = await prisma.package.create({
        data: {
          serviceId,
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          description: deliverables || name,
          price: parseFloat(price),
          depositAmount: parseFloat(depositAmount || "0"),
          durationMinutes: parseInt(durationMinutes) || 60,
          editedPhotosCount: parseInt(editedPhotosCount) || 15,
          deliverables: deliverables || "Edited Photos",
          isFeatured: Boolean(isFeatured),
          isActive: true,
        },
      });
      return NextResponse.json({ success: true, package: created });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Service operation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
