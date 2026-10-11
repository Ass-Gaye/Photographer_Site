import { PrismaClient, Role, BookingStatus, PaymentMethod, PaymentVerificationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ADU99 Photography database...");

  // 1. Initial Administrator
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@adu99photography.com";
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "AdminAdu99ChangeMe2026!";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      name: "ADU99 Lead Photographer",
      passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Created/updated administrator: ${admin.email}`);

  // 2. Default Site Settings (location, contacts & socials as published on
  //    Instagram flyer https://www.instagram.com/adu_studio99/p/DVzGPHeDbxT/)
  const siteSettingsData = {
    businessName: "ADU99 Photography",
    tagline: "Cinematic Visuals & Timeless Stories",
    bio: "ADU99 Photography is an editorial and portrait photography studio based in Wellingara, The Gambia. We specialize in intimate portraits, high-profile events, wedding stories, and editorial brand campaigns crafted with natural light, cinematic composition, and timeless warmth.",
    addressOrArea: "Wellingara, Latrikunda Highway, The Gambia",
    phone: "+220 3135947 / +220 2135552",
    whatsappNumber: "+2203135947",
    email: "contact@adu99photography.com",
    instagramUrl: "https://www.instagram.com/adu_studio99/",
    facebookUrl: "https://facebook.com/adu99photography",
    workingHours: "Monday – Saturday: 09:00 AM – 06:00 PM (GMT)",
    bookingNoticeHours: 24,
    maxBookingDaysInAdvance: 90,
    depositPercentageDefault: 50,
    cancellationPolicyText: "Cancellations made at least 72 hours prior to the session date can be rescheduled without forfeiting the booking deposit. Short-notice cancellations or no-shows are non-refundable.",
    termsText: "All photographic sessions are bound by the agreed terms of service. Final high-resolution edited images are delivered digitally via client download link within agreed delivery windows.",
    privacyText: "ADU99 Photography respects client privacy. Client photographs are published in the public portfolio only with client consent.",
    bankTransferInstructions: "Ecobank Gambia Ltd | Account Name: ADU99 Photography | Account No: 00123456789 | Branch: Wellingara",
    wavePaymentInstructions: "Wave / QMoney Mobile Transfer: Send payment to +220 3135947 with your Booking Reference as note.",
  };
  await prisma.siteSettings.upsert({
    where: { id: "primary" },
    update: siteSettingsData,
    create: { id: "primary", ...siteSettingsData },
  });

  // 3. Availability Rules (Mon - Sat, 09:00 - 18:00)
  for (let day = 0; day <= 6; day++) {
    const isWorkingDay = day !== 0; // Mon(1) to Sat(6) are open, Sun(0) closed
    await prisma.availabilityRule.upsert({
      where: { dayOfWeek: day },
      update: {
        isActive: isWorkingDay,
        startTime: "09:00",
        endTime: "18:00",
        slotDurationMinutes: 60,
        bufferMinutes: 30,
      },
      create: {
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        slotDurationMinutes: 60,
        bufferMinutes: 30,
        isActive: isWorkingDay,
      },
    });
  }

  // 4. Portfolio Categories
  const categoriesData = [
    { slug: "portraits", name: "Portraits & Personal", description: "Studio & on-location editorial portraits", sortOrder: 1 },
    { slug: "weddings", name: "Weddings & Celebrations", description: "Emotional, cinematic matrimonial stories", sortOrder: 2 },
    { slug: "graduations", name: "Graduations & Milestones", description: "Honoring academic and lifetime milestones", sortOrder: 3 },
    { slug: "events", name: "Events & Corporate", description: "Conferences, galas, and corporate branding", sortOrder: 4 },
    { slug: "fashion", name: "Fashion & Editorial", description: "High-contrast editorial concepts & lookbooks", sortOrder: 5 },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const record = await prisma.portfolioCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }

  // 5. Portfolio Projects built from real Instagram posts (@adu_studio99)
  const demoProjects = [
    {
      slug: "golden-hour-banjul-portrait",
      title: "Serene Sunlight: Coastal Portrait Series",
      categorySlug: "portraits",
      location: "Wellingara Studio, The Gambia",
      description: "An intimate natural light portrait series capturing tranquil tones, rich melanin warmth, and studio textures.",
      coverImage: "/instagram/post-12.jpg",
      isFeatured: true,
      images: [
        {
          url: "/instagram/post-12.jpg",
          caption: "Studio portrait in pink — signature editorial look",
          altText: "Woman in pink dress seated in studio",
          isCover: true,
          sortOrder: 1,
        },
        {
          url: "/instagram/post-11.jpg",
          caption: "Character portrait with natural styling",
          altText: "Studio portrait with warm backdrop",
          isCover: false,
          sortOrder: 2,
        },
        {
          url: "/instagram/post-5.jpg",
          caption: "Traditional attire portrait study",
          altText: "Man in white traditional wear on blue backdrop",
          isCover: false,
          sortOrder: 3,
        },
        {
          url: "/instagram/post-8.jpg",
          caption: "Environmental portrait session",
          altText: "Man in light blue traditional wear",
          isCover: false,
          sortOrder: 4,
        },
        {
          url: "/instagram/work-01.jpg",
          caption: "Portrait session in purple traditional wear",
          altText: "Man adjusting cuff in purple attire",
          isCover: false,
          sortOrder: 5,
        },
        {
          url: "/instagram/work-33.jpg",
          caption: "Seated portrait with studio greenery",
          altText: "Smiling man in white traditional wear seated",
          isCover: false,
          sortOrder: 6,
        },
      ],
    },
    {
      slug: "grace-and-tradition-wedding",
      title: "Tradition & Grace: Matrimonial Elegance",
      categorySlug: "weddings",
      location: "Wellingara, Latrikunda Highway",
      description: "Bridal and celebration coverage emphasizing authentic emotions, exquisite fabrics, and family joy.",
      coverImage: "/instagram/post-5.jpg",
      isFeatured: true,
      images: [
        {
          url: "/instagram/post-5.jpg",
          caption: "Celebration attire portrait",
          altText: "Traditional wear portrait from wedding season",
          isCover: true,
          sortOrder: 1,
        },
        {
          url: "/instagram/post-3.jpg",
          caption: "Devotion and tradition portrait",
          altText: "Man in brown traditional wear in prayer pose",
          isCover: false,
          sortOrder: 2,
        },
        {
          url: "/instagram/post-2.jpg",
          caption: "Koriteh photo shoot campaign",
          altText: "Studio campaign flyer with bridal portraits",
          isCover: false,
          sortOrder: 3,
        },
        {
          url: "/instagram/post-1.jpg",
          caption: "Tobaski celebration looks",
          altText: "Studio campaign with traditional celebration portraits",
          isCover: false,
          sortOrder: 4,
        },
        {
          url: "/instagram/work-10.jpg",
          caption: "Full-length traditional portrait",
          altText: "Man in brown traditional wear full length",
          isCover: false,
          sortOrder: 5,
        },
      ],
    },
    {
      slug: "scholarly-achievement-utg",
      title: "Legacy of Achievement: University Honor",
      categorySlug: "graduations",
      location: "Wellingara Studio, The Gambia",
      description: "Sophisticated milestone portraits celebrating scholastic dedication, pride, and future vision.",
      coverImage: "/instagram/post-11.jpg",
      isFeatured: true,
      images: [
        {
          url: "/instagram/post-11.jpg",
          caption: "Milestone celebration portrait",
          altText: "Woman in uniform portrait with honors",
          isCover: true,
          sortOrder: 1,
        },
        {
          url: "/instagram/post-1.jpg",
          caption: "Tobaski photo shoot celebration series",
          altText: "Studio campaign with traditional celebration looks",
          isCover: false,
          sortOrder: 2,
        },
        {
          url: "/instagram/work-40.jpg",
          caption: "Milestone portrait in white attire",
          altText: "Man in white traditional wear full length",
          isCover: false,
          sortOrder: 3,
        },
      ],
    },
    {
      slug: "atlantic-fashion-statement",
      title: "Urban Melanin: High-Fashion Lookbook",
      categorySlug: "fashion",
      location: "Wellingara Studio District",
      description: "Dramatic light, minimalist textiles, and expressive poses crafted for regional fashion looks.",
      coverImage: "/instagram/post-3.jpg",
      isFeatured: false,
      images: [
        {
          url: "/instagram/post-3.jpg",
          caption: "Editorial fashion portrait",
          altText: "Fashion portrait in traditional wear",
          isCover: true,
          sortOrder: 1,
        },
        {
          url: "/instagram/post-7.jpg",
          caption: "Koriteh special collection looks",
          altText: "Studio campaign with four fashion looks",
          isCover: false,
          sortOrder: 2,
        },
        {
          url: "/instagram/work-25.jpg",
          caption: "Fashion portrait in white and blue",
          altText: "Man in white traditional wear with blue backdrop",
          isCover: false,
          sortOrder: 3,
        },
        {
          url: "/instagram/work-05.jpg",
          caption: "Heritage brown collection look",
          altText: "Man in brown traditional wear portrait",
          isCover: false,
          sortOrder: 4,
        },
      ],
    },
    {
      slug: "on-the-field-sports",
      title: "Matchday Focus: Sports Action Coverage",
      categorySlug: "events",
      location: "Stadium Grounds, The Gambia",
      description: "Fast-paced field coverage — staying locked on the action from warm-up to final whistle.",
      coverImage: "/instagram/carousel-2a.jpg",
      isFeatured: false,
      images: [
        {
          url: "/instagram/carousel-2a.jpg",
          caption: "Locked on the action",
          altText: "Photographer shooting a football training session",
          isCover: true,
          sortOrder: 1,
        },
        {
          url: "/instagram/carousel-2b.jpg",
          caption: "Long lens field coverage",
          altText: "Photographer with telephoto lens on the field",
          isCover: false,
          sortOrder: 2,
        },
        {
          url: "/instagram/post-9.jpg",
          caption: "Matchday sidelines",
          altText: "Photographer covering a live match",
          isCover: false,
          sortOrder: 3,
        },
        {
          url: "/instagram/post-10.jpg",
          caption: "Editing pitch-side",
          altText: "Photographer reviewing shots on laptop",
          isCover: false,
          sortOrder: 4,
        },
      ],
    },
    {
      slug: "koriteh-signature-collection",
      title: "Koriteh Signature Collection",
      categorySlug: "fashion",
      location: "Wellingara Studio, The Gambia",
      description: "Festive Koriteh looks — crisp whites, sky blues, and confident studio poses.",
      coverImage: "/instagram/work-25.jpg",
      isFeatured: false,
      images: [
        {
          url: "/instagram/work-25.jpg",
          caption: "Signature Koriteh look in white and blue",
          altText: "Man in white traditional wear with blue backdrop",
          isCover: true,
          sortOrder: 1,
        },
        {
          url: "/instagram/work-33.jpg",
          caption: "Seated festive portrait",
          altText: "Smiling man in white traditional wear seated",
          isCover: false,
          sortOrder: 2,
        },
        {
          url: "/instagram/work-40.jpg",
          caption: "Full-length festive attire",
          altText: "Man in white traditional wear full length",
          isCover: false,
          sortOrder: 3,
        },
        {
          url: "/instagram/work-02.jpg",
          caption: "Koriteh collection extra look",
          altText: "Studio festive portrait",
          isCover: false,
          sortOrder: 4,
        },
        {
          url: "/instagram/work-03.jpg",
          caption: "Koriteh collection extra look",
          altText: "Studio festive portrait",
          isCover: false,
          sortOrder: 5,
        },
      ],
    },
    {
      slug: "heritage-brown-series",
      title: "Heritage in Brown: Traditional Series",
      categorySlug: "portraits",
      location: "Wellingara Studio, The Gambia",
      description: "Earthy brown traditional wear with prayer beads and embroidered detail.",
      coverImage: "/instagram/work-10.jpg",
      isFeatured: false,
      images: [
        {
          url: "/instagram/work-10.jpg",
          caption: "Full-length heritage portrait",
          altText: "Man in brown traditional wear full length",
          isCover: true,
          sortOrder: 1,
        },
        {
          url: "/instagram/work-05.jpg",
          caption: "Heritage portrait with clasped hands",
          altText: "Man in brown traditional wear portrait",
          isCover: false,
          sortOrder: 2,
        },
        {
          url: "/instagram/work-50.jpg",
          caption: "Heritage portrait with prayer beads",
          altText: "Man holding prayer beads in brown attire",
          isCover: false,
          sortOrder: 3,
        },
        {
          url: "/instagram/work-06.jpg",
          caption: "Heritage series extra look",
          altText: "Studio traditional portrait",
          isCover: false,
          sortOrder: 4,
        },
        {
          url: "/instagram/work-07.jpg",
          caption: "Heritage series extra look",
          altText: "Studio traditional portrait",
          isCover: false,
          sortOrder: 5,
        },
      ],
    },
  ];

  for (const projectData of demoProjects) {
    const categoryId = categoryMap.get(projectData.categorySlug);
    if (!categoryId) continue;

    const project = await prisma.portfolioProject.upsert({
      where: { slug: projectData.slug },
      update: {
        title: projectData.title,
        categoryId,
        location: projectData.location,
        description: projectData.description,
        coverImage: projectData.coverImage,
        isFeatured: projectData.isFeatured,
      },
      create: {
        slug: projectData.slug,
        title: projectData.title,
        categoryId,
        location: projectData.location,
        description: projectData.description,
        coverImage: projectData.coverImage,
        isFeatured: projectData.isFeatured,
        isPublished: true,
      },
    });

    await prisma.portfolioImage.deleteMany({ where: { projectId: project.id } });
    for (const img of projectData.images) {
      await prisma.portfolioImage.create({
        data: {
          projectId: project.id,
          url: img.url,
          caption: img.caption,
          altText: img.altText,
          isCover: img.isCover,
          sortOrder: img.sortOrder,
        },
      });
    }
  }

  // 6. Services & Packages
  const servicesConfig = [
    {
      slug: "portrait-session",
      name: "Portrait & Individual Sessions",
      description: "Tailored studio and environmental portrait sessions designed for creatives, professionals, birthdays, and individual milestones.",
      durationMinutes: 60,
      bufferMinutes: 30,
      startingPrice: 3500,
      depositAmount: 1750,
      coverImage: "/instagram/post-12.jpg",
      deliverables: "High-resolution edited digital gallery, private web download link, print release",
      packages: [
        {
          slug: "portrait-essential",
          name: "Essential Portrait",
          description: "Ideal for social media branding, clean headshots, or simple milestone sessions.",
          price: 3500,
          depositAmount: 1750,
          durationMinutes: 45,
          editedPhotosCount: 8,
          outfitChanges: 1,
          isIndoor: true,
          isOutdoor: true,
          locationType: "Studio or 1 Local Location",
          deliverables: "8 hand-retouched images in high resolution, online gallery, 5-day delivery",
          isFeatured: false,
          sortOrder: 1,
        },
        {
          slug: "portrait-signature",
          name: "Signature Editorial",
          description: "Our premier individual experience featuring multiple looks and cinematic lighting set-pieces.",
          price: 6500,
          depositAmount: 3250,
          durationMinutes: 90,
          editedPhotosCount: 18,
          outfitChanges: 3,
          isIndoor: true,
          isOutdoor: true,
          locationType: "Studio & Outdoor combination",
          deliverables: "18 master retouched images, all soft-proofs, online gallery, 3-day expedited delivery",
          isFeatured: true,
          sortOrder: 2,
        },
      ],
      addOns: [
        { name: "Additional Retouched Image", price: 250, description: "Per extra retouched image" },
        { name: "Rush Delivery (24-48 Hours)", price: 1500, description: "Fast-track processing for immediate turnarounds" },
        { name: "Extra Outfit Change", price: 500, description: "Adds 20 minutes to session time" },
      ],
    },
    {
      slug: "wedding-photography",
      name: "Wedding & Matrimonial Stories",
      description: "Comprehensive coverage of your special day, from bridal preparation and traditional nikah ceremonies to reception festivities.",
      durationMinutes: 360,
      bufferMinutes: 60,
      startingPrice: 25000,
      depositAmount: 12500,
      coverImage: "/instagram/post-2.jpg",
      deliverables: "Full day digital archive, highlight reel photos, custom photo book options",
      packages: [
        {
          slug: "wedding-classic",
          name: "Classic Wedding Day",
          description: "Coverage of religious ceremony, family formal portraits, and key reception moments.",
          price: 25000,
          depositAmount: 12500,
          durationMinutes: 300,
          editedPhotosCount: 80,
          outfitChanges: 2,
          isIndoor: true,
          isOutdoor: true,
          locationType: "Ceremony & Reception Venues",
          deliverables: "80 curated & color-graded images, full resolution digital gallery with 1-year hosting",
          isFeatured: false,
          sortOrder: 1,
        },
        {
          slug: "wedding-cinematic",
          name: "Royal Matrimonial Collection",
          description: "Full day comprehensive coverage with 2 shooters, bridal prep, reception, and couple sunset session.",
          price: 45000,
          depositAmount: 22500,
          durationMinutes: 480,
          editedPhotosCount: 160,
          outfitChanges: 4,
          isIndoor: true,
          isOutdoor: true,
          locationType: "Full day multi-location access",
          deliverables: "160 master graded photos, luxury leather photo album voucher, USB keepsake",
          isFeatured: true,
          sortOrder: 2,
        },
      ],
      addOns: [
        { name: "Pre-Wedding / Engagement Sunset Shoot", price: 5000, description: "90 min couple session before the wedding" },
        { name: "Second Shooter Photographer", price: 8000, description: "Assists with dual-angle candid coverage" },
      ],
    },
    {
      slug: "graduation-session",
      name: "Graduation & Academic Honors",
      description: "Commemorate your hard-earned university or college graduation with elegant, proud portraits.",
      durationMinutes: 60,
      bufferMinutes: 30,
      startingPrice: 4000,
      depositAmount: 2000,
      coverImage: "/instagram/post-11.jpg",
      deliverables: "Gown and cap styling portraits, family group shots, digital high-res download",
      packages: [
        {
          slug: "grad-solo",
          name: "Graduate Solo",
          description: "Personal graduation portrait session with academic regalia and casual attire.",
          price: 4000,
          depositAmount: 2000,
          durationMinutes: 45,
          editedPhotosCount: 10,
          outfitChanges: 2,
          isIndoor: true,
          isOutdoor: true,
          locationType: "Studio or Campus Ground",
          deliverables: "10 retouched digital files, print-ready format",
          isFeatured: true,
          sortOrder: 1,
        },
        {
          slug: "grad-family",
          name: "Graduate & Family Celebration",
          description: "Session incorporating graduate portraits plus formal group portraits with proud parents and family.",
          price: 6500,
          depositAmount: 3250,
          durationMinutes: 75,
          editedPhotosCount: 20,
          outfitChanges: 2,
          isIndoor: true,
          isOutdoor: true,
          locationType: "Studio or Venue",
          deliverables: "20 retouched photos, full download access",
          isFeatured: false,
          sortOrder: 2,
        },
      ],
      addOns: [
        { name: "Framed Canvas Print (A3)", price: 2000, description: "Premium wooden frame canvas print" },
      ],
    },
    {
      slug: "events-corporate",
      name: "Corporate, Galas & Events",
      description: "Professional documentation for brand activations, corporate summits, diplomatic meetings, and private galas.",
      durationMinutes: 180,
      bufferMinutes: 45,
      startingPrice: 12000,
      depositAmount: 6000,
      coverImage: "/instagram/carousel-2a.jpg",
      deliverables: "Same-day social media preview photos, full corporate gallery within 72 hours",
      packages: [
        {
          slug: "corporate-half-day",
          name: "Half-Day Event Coverage",
          description: "Up to 3 hours of on-site conference, seminar, or evening dinner event documentation.",
          price: 12000,
          depositAmount: 6000,
          durationMinutes: 180,
          editedPhotosCount: 50,
          outfitChanges: 0,
          isIndoor: true,
          isOutdoor: true,
          locationType: "Corporate Venue / Hotel Conference Hall",
          deliverables: "50 edited high-res images, license for corporate marketing & press releases",
          isFeatured: false,
          sortOrder: 1,
        },
      ],
      addOns: [
        { name: "Executive Headshot Station (Per Person)", price: 500, description: "On-site mobile studio lighting setup for team members" },
      ],
    },
  ];

  for (const s of servicesConfig) {
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        description: s.description,
        durationMinutes: s.durationMinutes,
        bufferMinutes: s.bufferMinutes,
        startingPrice: s.startingPrice,
        depositAmount: s.depositAmount,
        coverImage: s.coverImage,
        deliverables: s.deliverables,
      },
      create: {
        slug: s.slug,
        name: s.name,
        description: s.description,
        durationMinutes: s.durationMinutes,
        bufferMinutes: s.bufferMinutes,
        startingPrice: s.startingPrice,
        depositAmount: s.depositAmount,
        currency: "GMD",
        coverImage: s.coverImage,
        deliverables: s.deliverables,
        isActive: true,
      },
    });

    for (const pkg of s.packages) {
      await prisma.package.upsert({
        where: { slug: pkg.slug },
        update: {
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          depositAmount: pkg.depositAmount,
          durationMinutes: pkg.durationMinutes,
          editedPhotosCount: pkg.editedPhotosCount,
          outfitChanges: pkg.outfitChanges,
          locationType: pkg.locationType,
          deliverables: pkg.deliverables,
          isFeatured: pkg.isFeatured,
          sortOrder: pkg.sortOrder,
        },
        create: {
          serviceId: service.id,
          slug: pkg.slug,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          depositAmount: pkg.depositAmount,
          currency: "GMD",
          durationMinutes: pkg.durationMinutes,
          editedPhotosCount: pkg.editedPhotosCount,
          outfitChanges: pkg.outfitChanges,
          isIndoor: pkg.isIndoor,
          isOutdoor: pkg.isOutdoor,
          locationType: pkg.locationType,
          deliverables: pkg.deliverables,
          isFeatured: pkg.isFeatured,
          isActive: true,
          sortOrder: pkg.sortOrder,
        },
      });
    }

    for (const addOn of s.addOns) {
      const existing = await prisma.packageAddOn.findFirst({
        where: { serviceId: service.id, name: addOn.name },
      });
      if (!existing) {
        await prisma.packageAddOn.create({
          data: {
            serviceId: service.id,
            name: addOn.name,
            description: addOn.description,
            price: addOn.price,
            currency: "GMD",
          },
        });
      }
    }
  }

  // 7. FAQs
  const faqs = [
    {
      question: "How do I secure my booking date?",
      answer: "You can submit a booking request through our online booking calendar. Once we review your date and details, we will approve the request and issue deposit payment details. A 50% deposit confirms your slot on the calendar.",
      category: "Booking & Payments",
      sortOrder: 1,
    },
    {
      question: "What payment methods are accepted in The Gambia?",
      answer: "We accept Wave, QMoney mobile transfers, direct bank deposit/transfer (Ecobank Gambia), and in-studio cash payments.",
      category: "Booking & Payments",
      sortOrder: 2,
    },
    {
      question: "What is your rescheduling and cancellation policy?",
      answer: "If you notify us at least 72 hours before your scheduled session, your deposit can be transferred to a new available date within 60 days. Cancellations made with less than 72 hours notice are subject to a rescheduling fee.",
      category: "Policies",
      sortOrder: 3,
    },
    {
      question: "How and when will I receive my edited photographs?",
      answer: "You will receive an online private gallery link to preview and download your high-resolution edited images. Standard portrait delivery is 5 business days. Weddings and large events take 2 to 3 weeks.",
      category: "Delivery & Retouching",
      sortOrder: 4,
    },
    {
      question: "Do you travel outside the Greater Banjul Area?",
      answer: "Yes, we are available for sessions and weddings across The Gambia and internationally. Travel and logistics fees outside the Greater Banjul Area are calculated transparently and added to your package.",
      category: "Locations",
      sortOrder: 5,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
    }
  }

  // 8. Testimonials
  const testimonials = [
    {
      clientName: "Fatoumatta Jallow",
      roleOrEvent: "Bridal Portrait & Wedding Story",
      quotation: "ADU99 captured our wedding with such poetry and precision. Every glance, fabric detail, and joyous dance was recorded beautifully. We will treasure these memories forever.",
      rating: 5,
      photoUrl: "/instagram/post-3.jpg",
    },
    {
      clientName: "Ebrima Sanyang",
      roleOrEvent: "Executive Editorial & Branding",
      quotation: "The lighting and direction were world-class. ADU99 knows how to make you feel completely relaxed in front of the lens. The turnaround time was impressively fast.",
      rating: 5,
      photoUrl: "/instagram/post-8.jpg",
    },
    {
      clientName: "Isatou Ceesay",
      roleOrEvent: "University Graduation Milestone",
      quotation: "My graduation photos look straight out of a high-end magazine. My family and I couldn't be happier with the colors and clarity.",
      rating: 5,
      photoUrl: "/instagram/post-11.jpg",
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { clientName: t.clientName } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }

  // 9. Demonstration Initial Booking to verify flows
  const demoCustomer = await prisma.customer.upsert({
    where: { email: "mariama.bah@example.gm" },
    update: {},
    create: {
      fullName: "Mariama Bah",
      email: "mariama.bah@example.gm",
      phone: "+220 711 2233",
      notes: "Referred by social media for signature birthday session",
    },
  });

  const portraitService = await prisma.service.findUnique({ where: { slug: "portrait-session" } });
  const portraitPackage = await prisma.package.findUnique({ where: { slug: "portrait-signature" } });

  if (portraitService && portraitPackage) {
    const demoBookingRef = "ADU-2026-DEMO1";
    const existingBooking = await prisma.booking.findUnique({ where: { bookingReference: demoBookingRef } });

    if (!existingBooking) {
      const today = new Date();
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + 7); // 7 days in future

      const booking = await prisma.booking.create({
        data: {
          bookingReference: demoBookingRef,
          customerId: demoCustomer.id,
          serviceId: portraitService.id,
          packageId: portraitPackage.id,
          sessionDate,
          startTime: "11:00",
          endTime: "12:30",
          sessionType: "Signature Editorial",
          locationVenue: "ADU99 Studio / Fajara Coast",
          participantsCount: 1,
          notes: "Demo confirmed booking with verified deposit.",
          status: BookingStatus.DEPOSIT_PAID,
          basePrice: 6500,
          addOnsTotal: 0,
          totalAmount: 6500,
          depositRequired: 3250,
          depositPaid: 3250,
          balanceRemaining: 3250,
          currency: "GMD",
          internalNotes: "Verified via Wave transfer transaction receipt",
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: 3250,
          currency: "GMD",
          paymentMethod: PaymentMethod.MOBILE_MONEY_WAVE,
          transactionReference: "WAVE-GM-9823491",
          verificationStatus: PaymentVerificationStatus.VERIFIED,
          recordedBy: "Admin",
          notes: "Initial 50% deposit received via Wave",
        },
      });

      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: BookingStatus.PENDING_CONFIRMATION,
          toStatus: BookingStatus.DEPOSIT_PAID,
          changedBy: "Admin",
          reason: "Deposit received and verified",
        },
      });
    }
  }

  console.log("Database seeded successfully with initial data and demonstration assets!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
