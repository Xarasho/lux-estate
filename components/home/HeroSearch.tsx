"use client";

import React, { useState } from "react";

export interface HeroSearchProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onToggleFilters?: () => void;
  activeFiltersCount?: number;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "House", value: "house" },
  { label: "Apartment", value: "apartment" },
  { label: "Villa", value: "villa" },
  { label: "Penthouse", value: "penthouse" },
];

export function HeroSearch({
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  selectedCategory = "all",
  onSelectCategory,
  onToggleFilters,
  activeFiltersCount = 0,
}: HeroSearchProps) {
  const [internalQuery, setInternalQuery] = useState(searchQuery);

  // Keep internal input in sync if searchQuery changes externally (e.g. modal or reset)
  React.useEffect(() => {
    setInternalQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(internalQuery);
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight tracking-tight">
          Find your{" "}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">sanctuary</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0 rounded-sm"></span>
          </span>
          .
        </h1>

        {/* Search Bar Input */}
        <form
          onSubmit={handleFormSubmit}
          className="relative group max-w-2xl mx-auto"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors">
              search
            </span>
          </div>
          <input
            type="text"
            value={internalQuery}
            onChange={handleInputChange}
            placeholder="Search by city, neighborhood, or address..."
            className="block w-full pl-12 pr-28 py-4 rounded-xl border-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-base sm:text-lg outline-none"
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Category Pills & Filters */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(category.value)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-nordic-dark text-white shadow-lg shadow-nordic-dark/10 hover:-translate-y-0.5"
                    : "bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5"
                }`}
              >
                {category.label}
              </button>
            );
          })}

          <div className="w-px h-6 bg-nordic-dark/10 mx-2 flex-shrink-0"></div>

          <button
            type="button"
            onClick={onToggleFilters}
            className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm transition-colors cursor-pointer ${
              activeFiltersCount > 0
                ? "bg-[#006611]/10 text-[#006611] border border-[#006611]/30 font-semibold"
                : "text-nordic-dark hover:bg-black/5"
            }`}
          >
            <span className="material-icons text-base">tune</span> Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center text-xs bg-[#006611] text-white rounded-full font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
