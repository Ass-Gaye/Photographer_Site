"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Check, AlertCircle, Save } from "lucide-react";

interface SettingsData {
  businessName: string;
  tagline: string;
  bio: string;
  addressOrArea: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl?: string | null;
  workingHours: string;
  bookingNoticeHours: number;
  maxBookingDaysInAdvance: number;
  depositPercentageDefault: number;
  cancellationPolicyText: string;
  termsText: string;
  privacyText: string;
  bankTransferInstructions: string;
  wavePaymentInstructions: string;
}

export function SettingsManager({ initialSettings }: { initialSettings: SettingsData }) {
  const [formData, setFormData] = useState<SettingsData>(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (field: keyof SettingsData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setSuccessMsg("Studio settings saved and published successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving settings";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-sm text-xs text-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-sm text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Identity & Contact */}
      <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-6">
        <h2 className="font-serif text-lg text-white font-medium">Business Profile & Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Studio / Business Name"
            value={formData.businessName}
            onChange={(e) => handleChange("businessName", e.target.value)}
            required
          />
          <Input
            label="Tagline"
            value={formData.tagline}
            onChange={(e) => handleChange("tagline", e.target.value)}
            required
          />
          <Input
            label="Studio Physical Address / Area"
            value={formData.addressOrArea}
            onChange={(e) => handleChange("addressOrArea", e.target.value)}
            required
          />
          <Input
            label="Public Contact Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          <Input
            label="Studio Telephone Number"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
          <Input
            label="Official WhatsApp Number (E.164 without spaces, e.g. +2203135947)"
            value={formData.whatsappNumber}
            onChange={(e) => handleChange("whatsappNumber", e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Studio Bio & Philosophy (Displayed on Home & About)"
          value={formData.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          required
        />
      </div>

      {/* 2. Booking Constraints & Operating Parameters */}
      <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-6">
        <h2 className="font-serif text-lg text-white font-medium">Booking Calendar & Financial Rules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Minimum Advance Notice (Hours)"
            type="number"
            min="1"
            value={formData.bookingNoticeHours}
            onChange={(e) => handleChange("bookingNoticeHours", parseInt(e.target.value) || 0)}
            required
          />
          <Input
            label="Max Advance Booking Window (Days)"
            type="number"
            min="7"
            max="365"
            value={formData.maxBookingDaysInAdvance}
            onChange={(e) => handleChange("maxBookingDaysInAdvance", parseInt(e.target.value) || 0)}
            required
          />
          <Input
            label="Default Deposit Percentage (%)"
            type="number"
            min="10"
            max="100"
            value={formData.depositPercentageDefault}
            onChange={(e) => handleChange("depositPercentageDefault", parseInt(e.target.value) || 0)}
            required
          />
        </div>

        <Input
          label="Display Working Hours (e.g. Mon - Sat: 9:00 AM - 6:00 PM)"
          value={formData.workingHours}
          onChange={(e) => handleChange("workingHours", e.target.value)}
          required
        />
      </div>

      {/* 3. Payment Instructions (Bank & Wave) */}
      <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-6">
        <h2 className="font-serif text-lg text-white font-medium">Payment Instructions for Clients</h2>
        <div className="space-y-4">
          <Textarea
            label="Bank Transfer Instructions (Account Name, Bank, Account No)"
            value={formData.bankTransferInstructions}
            onChange={(e) => handleChange("bankTransferInstructions", e.target.value)}
            required
          />
          <Textarea
            label="Mobile Money (Wave / QMoney) Instructions"
            value={formData.wavePaymentInstructions}
            onChange={(e) => handleChange("wavePaymentInstructions", e.target.value)}
            required
          />
        </div>
      </div>

      {/* 4. Social Links */}
      <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-6">
        <h2 className="font-serif text-lg text-white font-medium">Social Media Handles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Instagram URL"
            value={formData.instagramUrl}
            onChange={(e) => handleChange("instagramUrl", e.target.value)}
          />
          <Input
            label="Facebook URL"
            value={formData.facebookUrl}
            onChange={(e) => handleChange("facebookUrl", e.target.value)}
          />
        </div>
      </div>

      {/* 5. Legal & Policies */}
      <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-6">
        <h2 className="font-serif text-lg text-white font-medium">Client Policies & Contracts</h2>
        <div className="space-y-4">
          <Textarea
            label="Cancellation & Rescheduling Policy"
            value={formData.cancellationPolicyText}
            onChange={(e) => handleChange("cancellationPolicyText", e.target.value)}
            required
          />
          <Textarea
            label="Terms of Service & Contract Clauses"
            value={formData.termsText}
            onChange={(e) => handleChange("termsText", e.target.value)}
            required
          />
          <Textarea
            label="Privacy & Image Rights Policy"
            value={formData.privacyText}
            onChange={(e) => handleChange("privacyText", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          <span>Save Studio Settings</span>
        </Button>
      </div>
    </form>
  );
}
