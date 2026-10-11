import * as React from "react";
import { cn } from "@/lib/utils";
import { BookingStatus, PaymentVerificationStatus } from "@prisma/client";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "success" | "warning" | "danger" | "neutral";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    gold: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    success: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
    warning: "bg-orange-950/60 text-orange-300 border-orange-800/60",
    danger: "bg-red-950/60 text-red-300 border-red-800/60",
    neutral: "bg-zinc-900 text-zinc-400 border-zinc-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return <Badge variant="success">Confirmed</Badge>;
    case BookingStatus.DEPOSIT_PAID:
      return <Badge variant="gold">Deposit Paid</Badge>;
    case BookingStatus.FULLY_PAID:
      return <Badge variant="success">Fully Settled</Badge>;
    case BookingStatus.PENDING_CONFIRMATION:
      return <Badge variant="warning">Pending Confirmation</Badge>;
    case BookingStatus.AWAITING_DEPOSIT:
      return <Badge variant="warning">Awaiting Deposit</Badge>;
    case BookingStatus.COMPLETED:
      return <Badge variant="default">Completed</Badge>;
    case BookingStatus.RESCHEDULE_REQUESTED:
      return <Badge variant="warning">Reschedule Requested</Badge>;
    case BookingStatus.CANCELLED:
      return <Badge variant="danger">Cancelled</Badge>;
    case BookingStatus.DECLINED:
      return <Badge variant="danger">Declined</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

export function PaymentStatusBadge({ status }: { status: PaymentVerificationStatus }) {
  switch (status) {
    case PaymentVerificationStatus.VERIFIED:
      return <Badge variant="success">Verified</Badge>;
    case PaymentVerificationStatus.PENDING_VERIFICATION:
      return <Badge variant="warning">Pending Verification</Badge>;
    case PaymentVerificationStatus.REJECTED:
      return <Badge variant="danger">Rejected</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}
