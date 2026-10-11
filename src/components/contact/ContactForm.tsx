"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Check, AlertCircle } from "lucide-react";

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceInterested, setServiceInterested] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          serviceInterested,
          preferredDate: preferredDate || null,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 text-center bg-[#141416] border border-zinc-800 rounded-sm space-y-4 animate-scale-in">
        <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <h3 className="font-serif text-xl text-white">Inquiry Received</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Thank you for reaching out. We have logged your inquiry and will follow up via email or WhatsApp within 24 hours.
        </p>
        <button
          onClick={() => {
            setIsSuccess(false);
            setMessage("");
          }}
          className="text-xs uppercase tracking-widest text-editorial-gold hover:underline pt-2 block mx-auto"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-sm text-xs text-red-300 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Name"
          required
          placeholder="e.g. Ebrima Sanyang"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="e.g. ebrima@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Telephone or WhatsApp"
          required
          placeholder="e.g. +220 3135947"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          label="Preferred Session Date (Optional)"
          type="date"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
        />
      </div>

      <Input
        label="Service of Interest"
        placeholder="e.g. Wedding, Portrait, Graduation, Corporate..."
        value={serviceInterested}
        onChange={(e) => setServiceInterested(e.target.value)}
      />

      <Textarea
        label="Message or Project Details"
        required
        placeholder="Describe your creative vision, location, timing, or any questions..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        isLoading={isSubmitting}
      >
        <span>Send Inquiry</span>
      </Button>
    </form>
  );
}
