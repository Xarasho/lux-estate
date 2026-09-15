"use client";

import React, { useState } from "react";

export interface HeartButtonProps {
  initialSaved?: boolean;
  onToggle?: (isSaved: boolean) => void;
  size?: "sm" | "md";
  className?: string;
}

export function HeartButton({
  initialSaved = false,
  onToggle,
  size = "md",
  className = "",
}: HeartButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isSaved;
    setIsSaved(nextState);
    if (onToggle) {
      onToggle(nextState);
    }
  };

  const dimensions =
    size === "md"
      ? "w-10 h-10"
      : "w-8 h-8";

  const iconSize = size === "md" ? "text-xl" : "text-lg";

  return (
    <button
      type="button"
      aria-label={isSaved ? "Remove from saved" : "Save property"}
      onClick={handleClick}
      className={`rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-sm ${dimensions} ${
        isSaved
          ? "text-red-500 hover:bg-red-50"
          : "text-nordic-dark hover:bg-mosque hover:text-white"
      } ${className}`}
    >
      <span
        className={`material-icons ${iconSize} transition-transform active:scale-125`}
      >
        {isSaved ? "favorite" : "favorite_border"}
      </span>
    </button>
  );
}
