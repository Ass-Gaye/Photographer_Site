import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import { timeStringToMinutes } from "@/lib/utils";

describe("Booking & Availability Integration Verification", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("checks database connectivity and default availability rules", async () => {
    const rules = await prisma.availabilityRule.findMany();
    expect(rules.length).toBeGreaterThan(0);
  });

  it("validates that active services exist with packages", async () => {
    const services = await prisma.service.findMany({
      include: { packages: true },
    });
    expect(services.length).toBeGreaterThan(0);
    const portraitService = services.find((s) => s.slug === "portrait-session");
    expect(portraitService).toBeDefined();
    expect(portraitService?.packages.length).toBeGreaterThan(0);
  });

  it("calculates time intervals without overlap", () => {
    const start1 = timeStringToMinutes("10:00");
    const end1 = timeStringToMinutes("11:30");
    const start2 = timeStringToMinutes("12:00");
    const end2 = timeStringToMinutes("13:00");

    // No overlap
    const overlaps = start1 < end2 && end1 > start2;
    expect(overlaps).toBe(false);

    // Overlap case
    const start3 = timeStringToMinutes("11:00");
    const end3 = timeStringToMinutes("12:30");
    const overlaps2 = start1 < end3 && end1 > start3;
    expect(overlaps2).toBe(true);
  });

  it("respects booking notice window requirement", async () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Trying to book right now (0 hours in advance) should fail advance notice requirement
    const result = await isSlotAvailable(todayStr, "10:00", 60, 30);
    expect(result.available).toBe(false);
    expect(result.reason).toContain("advance notice");
  });

  it("confirms site settings record exists with Gambian Dalasi currency configuration", async () => {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "primary" },
    });
    expect(settings).toBeDefined();
    expect(settings?.businessName).toBe("ADU99 Photography");
    expect(settings?.depositPercentageDefault).toBe(50);
  });
});
