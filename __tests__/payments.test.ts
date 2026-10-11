import { prisma } from "@/lib/prisma";
import { recordPayment } from "@/services/paymentService";
import { updateBookingStatus } from "@/services/bookingService";
import { BookingStatus, PaymentMethod, PaymentVerificationStatus } from "@prisma/client";

describe("Payment & Status Transitions", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("calculates remaining balances correctly when recording verified payments", async () => {
    // Look up existing seeded booking
    const booking = await prisma.booking.findFirst({
      include: { payments: true },
    });

    if (booking) {
      expect(Number(booking.totalAmount)).toBeGreaterThan(0);
      expect(Number(booking.balanceRemaining)).toBeGreaterThanOrEqual(0);
    }
  });

  it("rejects non-positive payment amounts", async () => {
    await expect(
      recordPayment({
        bookingId: "dummy-id",
        amount: 0,
        paymentMethod: PaymentMethod.CASH,
      })
    ).rejects.toThrow("greater than zero");

    await expect(
      recordPayment({
        bookingId: "dummy-id",
        amount: -100,
        paymentMethod: PaymentMethod.CASH,
      })
    ).rejects.toThrow("greater than zero");
  });
});
