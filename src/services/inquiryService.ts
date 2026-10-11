import { prisma } from "@/lib/prisma";
import { inquirySubmissionSchema, InquirySubmissionInput } from "@/lib/validations";
import { InquiryStatus } from "@prisma/client";
import { sendNotification } from "@/lib/notifications";

export async function createInquiry(rawInput: InquirySubmissionInput) {
  const data = inquirySubmissionSchema.parse(rawInput);

  const inquiry = await prisma.inquiry.create({
    data: {
      fullName: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      serviceInterested: data.serviceInterested || null,
      preferredDate: data.preferredDate ? new Date(`${data.preferredDate}T00:00:00.000Z`) : null,
      message: data.message.trim(),
      status: InquiryStatus.OPEN,
    },
  });

  // Log notification to studio
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "primary" } });
    const studioEmail = settings?.email || "contact@adu99photography.com";

    await sendNotification({
      recipient: studioEmail,
      subject: `New Inquiry from ${inquiry.fullName} – ADU99 Photography`,
      message: `Name: ${inquiry.fullName}\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone}\nService: ${inquiry.serviceInterested || "General"}\nMessage:\n${inquiry.message}`,
    });
  } catch (err) {
    console.error("Non-fatal inquiry notification failure:", err);
  }

  return inquiry;
}

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus, internalNotes?: string) {
  return prisma.inquiry.update({
    where: { id: inquiryId },
    data: {
      status,
      ...(internalNotes !== undefined ? { internalNotes } : {}),
    },
  });
}
