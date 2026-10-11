import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminApi();

    const bookings = await prisma.booking.findMany({
      include: {
        customer: true,
        service: true,
        package: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Reference",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Service",
      "Package",
      "Session Date",
      "Start Time",
      "End Time",
      "Status",
      "Total Amount",
      "Deposit Required",
      "Deposit Paid",
      "Balance Remaining",
      "Currency",
      "Venue",
      "Created At",
    ];

    const rows = bookings.map((b) => [
      `"${b.bookingReference}"`,
      `"${b.customer.fullName.replace(/"/g, '""')}"`,
      `"${b.customer.email}"`,
      `"${b.customer.phone}"`,
      `"${b.service.name}"`,
      `"${b.package ? b.package.name : ""}"`,
      `"${b.sessionDate.toISOString().split("T")[0]}"`,
      `"${b.startTime}"`,
      `"${b.endTime}"`,
      `"${b.status}"`,
      b.totalAmount.toString(),
      b.depositRequired.toString(),
      b.depositPaid.toString(),
      b.balanceRemaining.toString(),
      `"${b.currency}"`,
      `"${b.locationVenue.replace(/"/g, '""')}"`,
      `"${b.createdAt.toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="adu99-bookings-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
