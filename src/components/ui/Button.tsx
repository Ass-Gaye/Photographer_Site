import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-sm uppercase tracking-wider",
      md: "text-sm px-5 py-2.5 rounded-sm tracking-wide",
      lg: "text-base px-7 py-3.5 rounded-sm tracking-wider font-semibold",
    };

    const variantStyles = {
      primary:
        "bg-editorial-ivory text-black hover:bg-white focus:ring-editorial-ivory shadow-sm font-sans font-medium",
      secondary:
        "bg-editorial-card text-editorial-text border border-editorial-border hover:bg-editorial-muted hover:border-zinc-600 focus:ring-zinc-500",
      gold:
        "bg-editorial-gold text-black hover:bg-editorial-gold-light focus:ring-editorial-gold font-medium",
      outline:
        "border border-white/20 text-editorial-text hover:bg-white/5 hover:border-white/40 focus:ring-white",
      ghost:
        "text-zinc-400 hover:text-white hover:bg-white/5 focus:ring-zinc-600",
      danger:
        "bg-red-900/60 text-red-200 border border-red-800 hover:bg-red-800 focus:ring-red-500",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
