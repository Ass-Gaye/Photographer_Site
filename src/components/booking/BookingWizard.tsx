"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Calendar as CalendarIcon, Clock, ArrowRight, ArrowLeft, MessageCircle, AlertCircle, Info, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { buildWhatsAppLink, getBookingInquiryWhatsAppMessage } from "@/lib/whatsapp";

interface PackageAddOn {
  id: string;
  name: string;
  price: number | string | { toString(): string };
  description?: string | null;
}

interface PackageItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | string | { toString(): string };
  depositAmount: number | string | { toString(): string };
  durationMinutes: number;
  editedPhotosCount: number;
  outfitChanges: number;
  deliverables: string;
  isFeatured: boolean;
}

interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  startingPrice: number | string | { toString(): string };
  depositAmount: number | string | { toString(): string };
  coverImage?: string | null;
  packages: PackageItem[];
  addOns: PackageAddOn[];
}

interface BookingWizardProps {
  services: ServiceItem[];
  whatsappNumber?: string;
  initialServiceSlug?: string;
}

export function BookingWizard({
  services,
  whatsappNumber = "+2203135947",
  initialServiceSlug,
}: BookingWizardProps) {
  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    if (initialServiceSlug) {
      const match = services.find((s) => s.slug === initialServiceSlug);
      if (match) return match.id;
    }
    return services[0]?.id || "";
  });

  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  // Step 2: Date & Slot State
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<{ time: string; endTime: string; available: boolean; reason?: string }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Step 3: Session Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sessionType, setSessionType] = useState("Standard");
  const [locationVenue, setLocationVenue] = useState("");
  const [participantsCount, setParticipantsCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [referralSource, setReferralSource] = useState("");

  // Step 4: Terms
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingReference: string;
    customerName: string;
    serviceName: string;
    sessionDate: string;
    startTime: string;
    totalAmount: number;
    depositRequired: number;
    currency: string;
  } | null>(null);

  // Active Service & Package objects
  const activeService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || services[0],
    [services, selectedServiceId]
  );

  const activePackage = useMemo(
    () => activeService?.packages.find((p) => p.id === selectedPackageId) || null,
    [activeService, selectedPackageId]
  );

  // Auto-select first package if service changes
  useEffect(() => {
    if (activeService?.packages.length) {
      const featured = activeService.packages.find((p) => p.isFeatured);
      setSelectedPackageId(featured ? featured.id : activeService.packages[0].id);
    } else {
      setSelectedPackageId("");
    }
    setSelectedAddOnIds([]);
  }, [activeService]);

  // Load available time slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedServiceId) return;

    let isMounted = true;
    setIsLoadingSlots(true);
    setSlotsError(null);
    setSelectedTime("");

    const params = new URLSearchParams({
      date: selectedDate,
      serviceId: selectedServiceId,
      ...(selectedPackageId ? { packageId: selectedPackageId } : {}),
    });

    fetch(`/api/availability?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.error) {
          setSlotsError(data.error);
          setAvailableSlots([]);
        } else if (!data.isWorkingDay) {
          setSlotsError("The studio is closed on this day. Please select another date.");
          setAvailableSlots([]);
        } else {
          setAvailableSlots(data.slots || []);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setSlotsError("Could not retrieve availability for this date.");
        setAvailableSlots([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedServiceId, selectedPackageId]);

  // Price Snapshot Calculations
  const basePrice = useMemo(() => {
    if (activePackage) return Number(activePackage.price);
    if (activeService) return Number(activeService.startingPrice);
    return 0;
  }, [activePackage, activeService]);

  const addOnsTotal = useMemo(() => {
    if (!activeService) return 0;
    return selectedAddOnIds.reduce((sum, id) => {
      const addon = activeService.addOns.find((a) => a.id === id);
      return sum + (addon ? Number(addon.price) : 0);
    }, 0);
  }, [activeService, selectedAddOnIds]);

  const totalAmount = basePrice + addOnsTotal;

  const depositRequired = useMemo(() => {
    if (activePackage && Number(activePackage.depositAmount) > 0) {
      return Number(activePackage.depositAmount);
    }
    return Math.round(totalAmount * 0.5); // Default 50%
  }, [activePackage, totalAmount]);

  const balanceRemaining = totalAmount;

  // Toggle Add-on
  const handleToggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit Handler
  const handleSubmitBooking = async () => {
    if (!acceptTerms) {
      setSubmitError("Please accept the booking terms and cancellation policy.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        serviceId: selectedServiceId,
        packageId: selectedPackageId || null,
        sessionDate: selectedDate,
        startTime: selectedTime,
        fullName,
        email,
        phone,
        sessionType: activePackage ? activePackage.name : activeService.name,
        locationVenue,
        participantsCount,
        notes,
        referralSource,
        addOnIds: selectedAddOnIds,
        acceptTerms: true,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit booking request.");
      }

      setConfirmedBooking({
        bookingReference: data.bookingReference,
        customerName: data.customerName,
        serviceName: data.serviceName,
        sessionDate: selectedDate,
        startTime: selectedTime,
        totalAmount: Number(data.totalAmount),
        depositRequired: Number(data.depositRequired),
        currency: data.currency,
      });

      setCurrentStep(5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting request";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Min and Max dates for date picker
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto bg-[#121214] border border-zinc-800 rounded-sm shadow-2xl p-6 sm:p-10 font-sans">
      {/* Step Indicator Header */}
      {currentStep < 5 && (
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest font-medium mb-3 text-zinc-400">
            <span>Step {currentStep} of 4</span>
            <span className="text-editorial-gold">
              {currentStep === 1 && "Choose Service & Package"}
              {currentStep === 2 && "Select Date & Time"}
              {currentStep === 3 && "Session Details"}
              {currentStep === 4 && "Review & Submit"}
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-editorial-gold h-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: SERVICE & PACKAGE SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-white font-medium mb-1">
              Select Photography Service
            </h2>
            <p className="text-xs text-zinc-400">
              Choose the category of photography that best matches your creative vision or event.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={`p-4 rounded-sm border cursor-pointer transition-all ${
                  selectedServiceId === service.id
                    ? "bg-zinc-900 border-editorial-gold ring-1 ring-editorial-gold"
                    : "bg-[#161618] border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-serif text-base text-white">{service.name}</h3>
                  {selectedServiceId === service.id && (
                    <span className="w-5 h-5 rounded-full bg-editorial-gold text-black flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Starting from</span>
                  <span className="text-editorial-gold font-medium">
                    {formatCurrency(service.startingPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Packages of Selected Service */}
          {activeService && activeService.packages.length > 0 && (
            <div className="pt-6 border-t border-zinc-800/80 space-y-4">
              <h3 className="text-sm uppercase tracking-widest text-zinc-300 font-medium">
                Select Package Option
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeService.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`p-5 rounded-sm border cursor-pointer relative transition-all ${
                      selectedPackageId === pkg.id
                        ? "bg-zinc-900 border-editorial-gold ring-1 ring-editorial-gold"
                        : "bg-[#161618] border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {pkg.isFeatured && (
                      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider bg-editorial-gold/20 text-editorial-gold border border-editorial-gold/40 px-2 py-0.5 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                    <h4 className="font-serif text-base text-white">{pkg.name}</h4>
                    <p className="text-lg font-serif text-editorial-gold mt-1">
                      {formatCurrency(pkg.price)}
                    </p>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    <ul className="mt-4 space-y-1.5 text-xs text-zinc-400 border-t border-zinc-800/80 pt-3">
                      <li className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{pkg.durationMinutes} minutes session</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{pkg.editedPhotosCount} hand-retouched photos</span>
                      </li>
                      {pkg.outfitChanges > 0 && (
                        <li className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{pkg.outfitChanges} outfit changes</span>
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Add-Ons */}
          {activeService && activeService.addOns.length > 0 && (
            <div className="pt-6 border-t border-zinc-800/80 space-y-4">
              <h3 className="text-sm uppercase tracking-widest text-zinc-300 font-medium">
                Custom Session Add-Ons (Optional)
              </h3>
              <div className="space-y-2">
                {activeService.addOns.map((addon) => {
                  const isChecked = selectedAddOnIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddOn(addon.id)}
                      className={`p-3.5 rounded-sm border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-zinc-900 border-editorial-gold/80"
                          : "bg-[#161618] border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                            isChecked
                              ? "bg-editorial-gold border-editorial-gold text-black"
                              : "border-zinc-700"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{addon.name}</p>
                          {addon.description && (
                            <p className="text-[11px] text-zinc-500">{addon.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-editorial-gold font-medium">
                        +{formatCurrency(addon.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-6 flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(2)}
              disabled={!selectedServiceId}
            >
              <span>Continue to Schedule</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT DATE AND TIME */}
      {currentStep === 2 && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-white font-medium mb-1">
              Select Session Date & Time
            </h2>
            <p className="text-xs text-zinc-400">
              Our studio schedule reflects Banjul local time (GMT). Working days are Monday through Saturday.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Date Picker Input */}
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-wider font-medium text-zinc-400">
                Choose Preferred Date
              </label>
              <input
                type="date"
                min={minDateStr}
                max={maxDateStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#161618] border border-zinc-800 rounded-sm p-3.5 text-sm text-white focus:outline-none focus:border-editorial-gold"
              />
              <p className="text-[11px] text-zinc-500 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-zinc-500" />
                <span>Bookings require at least 24 hours advance notice.</span>
              </p>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-wider font-medium text-zinc-400">
                Available Time Slots
              </label>

              {!selectedDate && (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-sm text-xs text-zinc-500">
                  Select a date on the left to see available slots.
                </div>
              )}

              {isLoadingSlots && (
                <div className="p-8 text-center border border-zinc-800 rounded-sm text-xs text-zinc-400">
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Checking studio schedule...
                </div>
              )}

              {slotsError && !isLoadingSlots && (
                <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-sm text-xs text-amber-300">
                  {slotsError}
                </div>
              )}

              {selectedDate && !isLoadingSlots && !slotsError && availableSlots.length === 0 && (
                <div className="p-8 text-center border border-zinc-800 rounded-sm text-xs text-zinc-500">
                  No available time slots for this date. Please pick another date.
                </div>
              )}

              {selectedDate && !isLoadingSlots && availableSlots.length > 0 && (
                <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-sm border text-xs font-mono transition-all text-center ${
                        selectedTime === slot.time
                          ? "bg-editorial-gold text-black border-editorial-gold font-bold"
                          : slot.available
                          ? "bg-[#161618] border-zinc-800 text-zinc-200 hover:border-zinc-600"
                          : "bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed line-through"
                      }`}
                    >
                      {slot.time} – {slot.endTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 flex items-center justify-between border-t border-zinc-800/80">
            <Button variant="ghost" size="md" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(3)}
              disabled={!selectedDate || !selectedTime}
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: CLIENT & VENUE DETAILS */}
      {currentStep === 3 && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-white font-medium mb-1">
              Enter Session Details
            </h2>
            <p className="text-xs text-zinc-400">
              Provide your contact information and details regarding the session venue or location.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Mariama Bah"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. mariama@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Telephone or WhatsApp Number"
              required
              placeholder="e.g. +220 3135947"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Number of Participants"
              type="number"
              min={1}
              value={participantsCount}
              onChange={(e) => setParticipantsCount(Number(e.target.value))}
            />
            <div className="sm:col-span-2">
              <Input
                label="Session Location or Venue"
                required
                placeholder="e.g. ADU99 Studio (Wellingara) or Fajara Coast / Hotel"
                value={locationVenue}
                onChange={(e) => setLocationVenue(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Special Requests or Creative Notes (Optional)"
                placeholder="Mention outfit concepts, preferred aesthetics, or event specifics..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="How did you hear about ADU99 Photography? (Optional)"
                placeholder="e.g. Instagram, Friend referral, Google..."
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 flex items-center justify-between border-t border-zinc-800/80">
            <Button variant="ghost" size="md" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep(4)}
              disabled={!fullName.trim() || !email.trim() || !phone.trim() || !locationVenue.trim()}
            >
              <span>Review Booking</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & PRICE SNAPSHOT */}
      {currentStep === 4 && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-white font-medium mb-1">
              Review & Submit Booking Request
            </h2>
            <p className="text-xs text-zinc-400">
              Verify your booking details and agreed pricing summary before submitting.
            </p>
          </div>

          {submitError && (
            <div className="p-4 bg-red-950/40 border border-red-800 rounded-sm text-xs text-red-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Summary Card */}
          <div className="bg-[#161618] border border-zinc-800 p-6 rounded-sm space-y-4 text-xs">
            <div className="flex justify-between items-start pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-editorial-gold font-medium">
                  Session
                </span>
                <h4 className="text-base font-serif text-white mt-0.5">
                  {activeService.name} {activePackage && `— ${activePackage.name}`}
                </h4>
                <p className="text-zinc-400 mt-1">
                  {formatDate(selectedDate)} at {selectedTime} (GMT)
                </p>
                <p className="text-zinc-400">Location: {locationVenue}</p>
              </div>
              <span className="text-xs font-mono bg-zinc-900 border border-zinc-700 px-2.5 py-1 rounded-sm text-zinc-300">
                Pending Approval
              </span>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-zinc-400">
                <span>Base Package Price</span>
                <span className="font-mono text-zinc-200">{formatCurrency(basePrice)}</span>
              </div>
              {selectedAddOnIds.length > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>Selected Add-Ons ({selectedAddOnIds.length})</span>
                  <span className="font-mono text-zinc-200">+{formatCurrency(addOnsTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-medium text-sm pt-2 border-t border-zinc-800">
                <span>Total Estimated Price</span>
                <span className="font-mono text-editorial-gold">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 pt-1">
                <span>Deposit Due Upon Confirmation</span>
                <span className="font-mono text-zinc-200">{formatCurrency(depositRequired)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Remaining Balance</span>
                <span className="font-mono text-zinc-200">{formatCurrency(balanceRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Policy & Terms Checkbox */}
          <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-sm space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-sm border-zinc-700 bg-zinc-900 text-editorial-gold focus:ring-editorial-gold"
              />
              <span className="text-xs text-zinc-400 leading-relaxed">
                I understand that this request is subject to studio approval. Once approved, a{" "}
                <strong className="text-zinc-200">50% deposit ({formatCurrency(depositRequired)})</strong> is
                required via Wave or Bank Transfer to confirm the slot. I agree to the{" "}
                <Link href="/booking-policy" target="_blank" className="text-editorial-gold hover:underline">
                  Rescheduling & Cancellation Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" target="_blank" className="text-editorial-gold hover:underline">
                  Terms of Service
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Action Row */}
          <div className="pt-6 flex items-center justify-between border-t border-zinc-800/80">
            <Button variant="ghost" size="md" onClick={() => setCurrentStep(3)} disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitBooking}
              isLoading={isSubmitting}
              disabled={!acceptTerms || isSubmitting}
            >
              <span>Submit Booking Request</span>
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS CONFIRMATION SCREEN */}
      {currentStep === 5 && confirmedBooking && (
        <div className="text-center py-8 space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-ultra text-emerald-400 font-medium">
              Request Received Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-white font-medium">
              Booking Reference: #{confirmedBooking.bookingReference}
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-white">{confirmedBooking.customerName}</strong>. Your session for{" "}
              <strong className="text-white">{confirmedBooking.serviceName}</strong> on{" "}
              <strong className="text-white">{formatDate(confirmedBooking.sessionDate)} at {confirmedBooking.startTime} (GMT)</strong>{" "}
              has been recorded and is currently <strong className="text-amber-400">Pending Studio Confirmation</strong>.
            </p>
          </div>

          {/* WhatsApp Direct Action Button */}
          <div className="pt-4 max-w-md mx-auto space-y-3">
            <a
              href={buildWhatsAppLink(
                whatsappNumber,
                getBookingInquiryWhatsAppMessage(
                  confirmedBooking.bookingReference,
                  confirmedBooking.serviceName,
                  formatDate(confirmedBooking.sessionDate),
                  confirmedBooking.startTime
                )
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3.5 px-6 rounded-sm text-sm transition-colors shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Follow up on WhatsApp with Reference</span>
            </a>

            <Link href={`/my-booking?ref=${confirmedBooking.bookingReference}&email=${encodeURIComponent(email)}`}>
              <Button variant="secondary" size="md" className="w-full mt-2">
                <span>View & Track Booking Status</span>
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-zinc-900 text-[11px] text-zinc-500 max-w-sm mx-auto">
            A confirmation receipt has also been logged for your email address. You can return to check your status at any time.
          </div>
        </div>
      )}
    </div>
  );
}
