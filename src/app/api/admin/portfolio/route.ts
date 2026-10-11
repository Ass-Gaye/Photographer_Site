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

    const projects = await prisma.portfolioProject.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(projects);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load projects";
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

    if (action === "toggle-published") {
      const { id, isPublished } = body;
      const updated = await prisma.portfolioProject.update({
        where: { id },
        data: { isPublished },
      });
      return NextResponse.json({ success: true, project: updated });
    }

    if (action === "toggle-featured") {
      const { id, isFeatured } = body;
      const updated = await prisma.portfolioProject.update({
        where: { id },
        data: { isFeatured },
      });
      return NextResponse.json({ success: true, project: updated });
    }

    if (action === "create-project") {
      const { title, slug, categoryId, clientName, shootDate, location, description, coverImage, isFeatured } = body;

      const project = await prisma.portfolioProject.create({
        data: {
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          categoryId,
          clientName: clientName || null,
          shootDate: shootDate ? new Date(`${shootDate}T00:00:00.000Z`) : null,
          location: location || "The Gambia",
          description: description || null,
          coverImage,
          isFeatured: Boolean(isFeatured),
          isPublished: true,
          images: {
            create: [
              {
                url: coverImage,
                altText: `${title} - Cover Photo`,
                isCover: true,
                sortOrder: 0,
              },
            ],
          },
        },
        include: {
          category: true,
          images: true,
        },
      });

      return NextResponse.json({ success: true, project });
    }

    if (action === "delete-project") {
      const { id } = body;
      await prisma.portfolioProject.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Portfolio operation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
