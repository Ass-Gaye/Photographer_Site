"use client";

import React, { useState } from "react";
import { formatDate } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MessageSquare, Phone, Mail, CheckCircle, Calendar, MessageCircle, AlertCircle } from "lucide-react";
import { InquiryStatus } from "@prisma/client";

interface InquiryItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceInterested?: string | null;
  preferredDate?: Date | string | null;
  message: string;
  status: InquiryStatus;
  internalNotes?: string | null;
  createdAt: Date | string;
}

export function InquiriesManager({ initialInquiries }: { initialInquiries: InquiryItem[] }) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>(initialInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(
    initialInquiries[0] || null
  );
  const [status, setStatus] = useState<InquiryStatus>(selectedInquiry?.status || "OPEN");
  const [notes, setNotes] = useState<string>(selectedInquiry?.internalNotes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectInquiry = (inq: InquiryItem) => {
    setSelectedInquiry(inq);
    setStatus(inq.status);
    setNotes(inq.internalNotes || "");
    setFeedback(null);
  };

  const handleUpdate = async () => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedInquiry.id,
          status,
          internalNotes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update inquiry");

      setInquiries((prev) =>
        prev.map((item) => (item.id === selectedInquiry.id ? data.inquiry : item))
      );
      setSelectedInquiry(data.inquiry);
      setFeedback("Inquiry updated successfully.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error updating";
      setFeedback(`Error: ${msg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (s: InquiryStatus) => {
    switch (s) {
      case "OPEN":
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">Open</span>;
      case "IN_PROGRESS":
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">In Progress</span>;
      case "REPLIED":
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">Replied</span>;
      case "CONVERTED_TO_BOOKING":
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">Converted</span>;
      case "CLOSED":
        return <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">Closed</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      {/* List Column */}
      <div className="lg:col-span-5 space-y-3">
        {inquiries.length === 0 ? (
          <div className="p-8 text-center bg-[#121214] border border-zinc-800 rounded-sm text-zinc-500 text-xs">
            No inquiries recorded yet.
          </div>
        ) : (
          inquiries.map((inq) => (
            <div
              key={inq.id}
              onClick={() => selectInquiry(inq)}
              className={`p-4 rounded-sm border cursor-pointer transition-all ${
                selectedInquiry?.id === inq.id
                  ? "bg-[#18181A] border-editorial-gold ring-1 ring-editorial-gold"
                  : "bg-[#121214] border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-medium text-white text-xs truncate">{inq.fullName}</span>
                {getStatusBadge(inq.status)}
              </div>
              <p className="text-[11px] text-zinc-400 truncate mb-2">{inq.message}</p>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>{inq.serviceInterested || "General Inquiry"}</span>
                <span>{formatDate(inq.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail & Action Column */}
      <div className="lg:col-span-7">
        {selectedInquiry ? (
          <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">
                  Inquiry #{selectedInquiry.id.slice(-6).toUpperCase()}
                </span>
                <h2 className="text-xl font-serif text-white mt-1">{selectedInquiry.fullName}</h2>
              </div>
              <div>{getStatusBadge(selectedInquiry.status)}</div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-sm space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">Email</span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-white hover:underline flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-editorial-gold" />
                  <span>{selectedInquiry.email}</span>
                </a>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-sm space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">Phone / WhatsApp</span>
                <a href={`tel:${selectedInquiry.phone}`} className="text-white hover:underline flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-editorial-gold" />
                  <span>{selectedInquiry.phone}</span>
                </a>
              </div>
            </div>

            {/* Inquiry Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Interested in: <strong className="text-white">{selectedInquiry.serviceInterested || "General"}</strong>
                </span>
                {selectedInquiry.preferredDate && (
                  <span>
                    Target Date: <strong className="text-white">{formatDate(selectedInquiry.preferredDate)}</strong>
                  </span>
                )}
              </div>
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-sm text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={buildWhatsAppLink(
                  selectedInquiry.phone,
                  `Hello ${selectedInquiry.fullName}, thank you for contacting ADU99 Photography regarding your inquiry.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3.5 py-2 rounded-sm font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message Client on WhatsApp</span>
              </a>

              <a
                href={`mailto:${selectedInquiry.email}?subject=ADU99%20Photography%20Follow-up`}
                className="inline-flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3.5 py-2 rounded-sm font-medium transition-colors border border-zinc-700"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            </div>

            {/* Status & Notes Control */}
            <div className="pt-6 border-t border-zinc-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Update Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as InquiryStatus)}
                    className="w-full bg-[#18181A] border border-zinc-700 rounded-sm px-3 py-2 text-white text-xs focus:outline-none focus:border-editorial-gold"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="REPLIED">REPLIED</option>
                    <option value="CONVERTED_TO_BOOKING">CONVERTED TO BOOKING</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <Textarea
                label="Internal Studio Notes"
                placeholder="Log follow-up attempts, price quoted, or phone discussion notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {feedback && (
                <div className={`p-3 rounded-sm text-xs ${feedback.startsWith("Error") ? "bg-red-950/40 text-red-300 border border-red-800" : "bg-emerald-950/40 text-emerald-300 border border-emerald-800"}`}>
                  {feedback}
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleUpdate}
                isLoading={isUpdating}
              >
                <span>Save Inquiry Status & Notes</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-[#121214] border border-zinc-800 rounded-sm text-zinc-500 text-xs">
            Select an inquiry from the left to view details and follow up.
          </div>
        )}
      </div>
    </div>
  );
}
