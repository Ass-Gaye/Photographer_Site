import {
  formatCurrency,
  formatDate,
  generateBookingReference,
  timeStringToMinutes,
  minutesToTimeString,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("formatCurrency", () => {
    it("formats Dalasi correctly", () => {
      expect(formatCurrency(5000, "GMD")).toBe("D 5,000");
      expect(formatCurrency("12500.5", "GMD")).toBe("D 12,500.5");
      expect(formatCurrency(0, "GMD")).toBe("D 0");
    });

    it("handles null and undefined safely", () => {
      expect(formatCurrency(null)).toBe("D 0.00");
      expect(formatCurrency(undefined)).toBe("D 0.00");
    });
  });

  describe("Time conversions", () => {
    it("converts time string to minutes and back", () => {
      expect(timeStringToMinutes("09:00")).toBe(540);
      expect(timeStringToMinutes("14:30")).toBe(870);
      expect(minutesToTimeString(540)).toBe("09:00");
      expect(minutesToTimeString(870)).toBe("14:30");
    });
  });

  describe("generateBookingReference", () => {
    it("generates a formatted reference matching ADU pattern", () => {
      const ref = generateBookingReference();
      expect(ref).toMatch(/^ADU-\d{6}-[A-Z0-9]{4}$/);
    });
  });
});
