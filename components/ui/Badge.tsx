import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "exclusive" | "new-arrival" | "for-sale" | "for-rent" | "neutral";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  switch (variant) {
    case "exclusive":
    case "new-arrival":
      return (
        <span
          className={`bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-nordic-dark shadow-sm ${className}`}
        >
          {children}
        </span>
      );

    case "for-sale":
      return (
        <span
          className={`bg-nordic-dark/90 text-white text-xs font-bold px-2 py-1 rounded tracking-wide shadow-sm ${className}`}
        >
          {children}
        </span>
      );

    case "for-rent":
      return (
        <span
          className={`bg-mosque/90 text-white text-xs font-bold px-2 py-1 rounded tracking-wide shadow-sm ${className}`}
        >
          {children}
        </span>
      );

    default:
      return (
        <span
          className={`bg-white/90 text-nordic-dark text-xs font-medium px-2.5 py-1 rounded shadow-sm ${className}`}
        >
          {children}
        </span>
      );
  }
}
