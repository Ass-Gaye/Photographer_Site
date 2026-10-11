import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs uppercase tracking-wider font-medium text-zinc-400">
            {label}
            {props.required && <span className="text-editorial-gold ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-[#121214] border border-[#27272A] rounded-sm px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
