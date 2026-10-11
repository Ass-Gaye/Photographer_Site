import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentVerificationStatus } from "@prisma/client";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "primary" },
  });

  if (!settings) {
    return {
      businessName: "ADU99 Photography",
      tagline: "Cinematic Visuals & Timeless Stories",
      bio: "Editorial and portrait photography studio based in Wellingara, The Gambia.",
      addressOrArea: "Wellingara, Latrikunda Highway, The Gambia",
      phone: "+220 3135947 / +220 2135552",
      whatsappNumber: "+2203135947",
      email: "contact@adu99photography.com",
      workingHours: "Mon - Sat: 9:00 AM - 6:00 PM",
      bookingNoticeHours: 24,
      maxBookingDaysInAdvance: 90,
      instagramUrl: "https://www.instagram.com/adu_studio99/",
      facebookUrl: "https://facebook.com/adu99photography",
      depositPercentageDefault: 50,
      cancellationPolicyText: "Cancellations made 72 hours prior to session date can be rescheduled without forfeiting deposit.",
      termsText: "All photography contracts and bookings are subject to mutual studio agreement.",
      privacyText: "We respect your personal privacy and client photograph rights.",
      bankTransferInstructions: "Ecobank Gambia Ltd / Account Name: ADU99 Photography / Account No: 00123456789",
      wavePaymentInstructions: "Wave / QMoney Transfer: +220 3135947 (Ref: Booking Ref)",
    };
  }

  return settings;
}

export async function getServices(includeInactive = false) {
  return prisma.service.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: {
      packages: {
        where: includeInactive ? {} : { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      addOns: {
        where: includeInactive ? {} : { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findUnique({
    where: { slug },
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      addOns: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getPortfolioCategories() {
  return prisma.portfolioCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPortfolioProjects(categorySlug?: string, featuredOnly?: boolean) {
  return prisma.portfolioProject.findMany({
    where: {
      isPublished: true,
      ...(categorySlug && categorySlug !== "all" ? { category: { slug: categorySlug } } : {}),
      ...(featuredOnly ? { isFeatured: true } : {}),
    },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPortfolioProjectBySlug(slug: string) {
  return prisma.portfolioProject.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getFAQs() {
  return prisma.fAQ.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { isApproved: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getDashboardOverviewMetrics() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Today's sessions
  const todaysSessions = await prisma.booking.count({
    where: {
      sessionDate: { gte: startOfDay, lte: endOfDay },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.DEPOSIT_PAID, BookingStatus.FULLY_PAID] },
    },
  });

  // Upcoming confirmed
  const upcomingBookings = await prisma.booking.count({
    where: {
      sessionDate: { gt: endOfDay },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.DEPOSIT_PAID, BookingStatus.FULLY_PAID] },
    },
  });

  // Pending confirmation
  const pendingRequests = await prisma.booking.count({
    where: { status: BookingStatus.PENDING_CONFIRMATION },
  });

  // Total confirmed
  const confirmedBookings = await prisma.booking.count({
    where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.DEPOSIT_PAID, BookingStatus.FULLY_PAID] } },
  });

  // Cancelled bookings
  const cancelledBookings = await prisma.booking.count({
    where: { status: BookingStatus.CANCELLED },
  });

  // Verified Payments sum
  const verifiedPayments = await prisma.payment.findMany({
    where: { verificationStatus: PaymentVerificationStatus.VERIFIED },
    select: { amount: true },
  });
  const totalVerifiedRevenue = verifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Outstanding balances on active sessions
  const activeBookings = await prisma.booking.findMany({
    where: {
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.DEPOSIT_PAID, BookingStatus.PENDING_CONFIRMATION],
      },
    },
    select: { balanceRemaining: true, depositRequired: true, depositPaid: true },
  });

  const totalOutstandingBalance = activeBookings.reduce((sum, b) => sum + Number(b.balanceRemaining), 0);
  const totalOutstandingDeposit = activeBookings.reduce((sum, b) => {
    const remainingDep = Math.max(0, Number(b.depositRequired) - Number(b.depositPaid));
    return sum + remainingDep;
  }, 0);

  // Recent inquiries count
  const openInquiries = await prisma.inquiry.count({
    where: { status: "OPEN" },
  });

  return {
    todaysSessions,
    upcomingBookings,
    pendingRequests,
    confirmedBookings,
    cancelledBookings,
    totalVerifiedRevenue,
    totalOutstandingBalance,
    totalOutstandingDeposit,
    openInquiries,
  };
}
