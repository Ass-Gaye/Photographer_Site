import {
  bookingSubmissionSchema,
  inquirySubmissionSchema,
  paymentRecordSchema,
} from "@/lib/validations";
import { buildWhatsAppLink, getBookingInquiryWhatsAppMessage } from "@/lib/whatsapp";

describe("Validations Schema Tests", () => {
  describe("bookingSubmissionSchema", () => {
    it("validates valid booking input", () => {
      const valid = {
        serviceId: "srv-portrait",
        packageId: "pkg-studio",
        sessionDate: "2026-11-20",
        startTime: "11:00",
        fullName: "Amadou Jallow",
        email: "amadou@example.com",
        phone: "+220 788 1234",
        sessionType: "Portrait",
        locationVenue: "ADU99 Studio Kairaba",
        participantsCount: 2,
        addOnIds: [],
        acceptTerms: true,
      };

      const result = bookingSubmissionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects booking if terms are not accepted", () => {
      const invalid = {
        serviceId: "srv-portrait",
        sessionDate: "2026-11-20",
        startTime: "11:00",
        fullName: "Amadou Jallow",
        email: "amadou@example.com",
        phone: "+220 788 1234",
        locationVenue: "Studio",
        acceptTerms: false,
      };

      const result = bookingSubmissionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid email and time formats", () => {
      const invalid = {
        serviceId: "srv-portrait",
        sessionDate: "2026-11-20",
        startTime: "25:99",
        fullName: "A",
        email: "not-an-email",
        phone: "123",
        locationVenue: "S",
        acceptTerms: true,
      };

      const result = bookingSubmissionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("paymentRecordSchema", () => {
    it("validates positive payment amount", () => {
      const valid = {
        bookingId: "bkg-123",
        amount: 2500,
        paymentMethod: "MOBILE_MONEY_WAVE",
        transactionReference: "WAVE-987654",
      };

      const result = paymentRecordSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects negative or zero payment amounts", () => {
      const invalid = {
        bookingId: "bkg-123",
        amount: -500,
        paymentMethod: "CASH",
      };

      const result = paymentRecordSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

describe("WhatsApp Utilities", () => {
  it("builds correct wa.me link with encoded text", () => {
    const link = buildWhatsAppLink("+2207999999", "Hello Studio!");
    expect(link).toContain("https://wa.me/2207999999?text=");
    expect(link).toContain("Hello%20Studio!");
  });

  it("formats booking inquiry message including booking reference", () => {
    const msg = getBookingInquiryWhatsAppMessage(
      "ADU-2601-ABCD",
      "Editorial Portrait",
      "20 Nov 2026",
      "10:00"
    );
    expect(msg).toContain("ADU-2601-ABCD");
    expect(msg).toContain("Editorial Portrait");
  });
});
