"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { LocationSuggestion } from "@/lib/properties";

export interface HeroSearchProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onToggleFilters?: () => void;
  activeFiltersCount?: number;
  availableLocations?: LocationSuggestion[];
  dict?: any;
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
  selectedCategory = "",
  onSelectCategory,
  onToggleFilters,
  activeFiltersCount = 0,
  availableLocations = [],
  dict,
}: HeroSearchProps) {
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep internal input in sync if searchQuery changes externally
  useEffect(() => {
    setInternalQuery(searchQuery);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter matching locations in real-time based on what user is typing
  const matchingLocations = useMemo(() => {
    const q = internalQuery.trim().toLowerCase();
    if (!q) {
      // When empty and focused, show popular top locations
      return availableLocations.slice(0, 5);
    }

    return availableLocations.filter((item) => {
      const matchCity = item.city.toLowerCase().includes(q);
      const matchState = item.state?.toLowerCase().includes(q) ?? false;
      const matchCountry = item.country?.toLowerCase().includes(q) ?? false;
      const matchAddress = item.address?.toLowerCase().includes(q) ?? false;
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchSublabel = item.sublabel?.toLowerCase().includes(q) ?? false;
      return matchCity || matchState || matchCountry || matchAddress || matchLabel || matchSublabel;
    }).slice(0, 6);
  }, [internalQuery, availableLocations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    setHighlightedIndex(-1);
    if (!isFocused) setIsFocused(true);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleSelectLocation = (location: LocationSuggestion) => {
    const valueToSet = location.city;
    setInternalQuery(valueToSet);
    setIsFocused(false);
    if (onSearchChange) {
      onSearchChange(valueToSet);
    }
    if (onSearchSubmit) {
      onSearchSubmit(valueToSet);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFocused(false);
    if (highlightedIndex >= 0 && matchingLocations[highlightedIndex]) {
      handleSelectLocation(matchingLocations[highlightedIndex]);
    } else if (onSearchSubmit) {
      onSearchSubmit(internalQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || matchingLocations.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < matchingLocations.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : matchingLocations.length - 1
      );
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  const handleCategoryClick = (categoryValue: string) => {
    if (!onSelectCategory) return;
    if (selectedCategory && selectedCategory.toLowerCase() === categoryValue.toLowerCase()) {
      // Toggle off: no chip is clicked
      onSelectCategory("");
    } else {
      // Click this chip: house, apartment, villa, all, or penthouse
      onSelectCategory(categoryValue);
    }
  };

  // Helper to highlight matching characters
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="font-bold text-mosque underline decoration-mosque/40">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const showDropdown = isFocused;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight tracking-tight">
          {dict?.title_start || "Find your"}{" "}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">{dict?.title_highlight || "sanctuary"}</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0 rounded-sm"></span>
          </span>
          .
        </h1>

        {/* Search Bar Input & Dropdown Container */}
        <div ref={containerRef} className="relative group max-w-2xl mx-auto z-30">
          <form onSubmit={handleFormSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors">
                search
              </span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={internalQuery}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder={dict?.placeholder || "Search by title, city, neighborhood, or address..."}
              className="block w-full pl-12 pr-28 py-4 rounded-xl border-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-base sm:text-lg outline-none"
              autoComplete="off"
            />
            {internalQuery && (
              <button
                type="button"
                onClick={() => {
                  setInternalQuery("");
                  if (onSearchChange) onSearchChange("");
                  if (onSearchSubmit) onSearchSubmit("");
                  inputRef.current?.focus();
                }}
                className="absolute inset-y-0 right-24 pr-2 flex items-center text-nordic-muted hover:text-nordic-dark cursor-pointer transition-colors"
                title="Clear search"
              >
                <span className="material-icons text-lg">cancel</span>
              </button>
            )}
            <button
              type="submit"
              className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20 cursor-pointer"
            >
              {dict?.search || "Search"}
            </button>
          </form>

          {/* Location Matches Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-nordic-dark/10 overflow-hidden text-left z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 bg-nordic-dark/[0.03] border-b border-nordic-dark/5 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-nordic-muted flex items-center gap-1.5">
                  <span className="material-icons text-sm text-mosque">place</span>
                  {internalQuery.trim() ? "Matching Locations" : "Popular Locations"}
                </span>
                <span className="text-[11px] text-nordic-muted">
                  {matchingLocations.length} found
                </span>
              </div>

              {matchingLocations.length > 0 ? (
                <ul className="py-1 max-h-72 overflow-y-auto divide-y divide-nordic-dark/5">
                  {matchingLocations.map((item, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <li
                        key={`${item.city}-${item.address || ""}-${idx}`}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onClick={() => handleSelectLocation(item)}
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                          isHighlighted ? "bg-mosque/10" : "hover:bg-nordic-dark/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            isHighlighted ? "bg-mosque text-white" : "bg-mosque/10 text-mosque"
                          }`}>
                            <span className="material-icons text-base">location_on</span>
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-nordic-dark truncate">
                              {highlightMatch(item.label, internalQuery)}
                            </p>
                            {item.sublabel && (
                              <p className="text-xs text-nordic-muted truncate">
                                {highlightMatch(item.sublabel, internalQuery)}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-nordic-dark/5 text-nordic-muted flex-shrink-0 ml-2">
                          {item.count} {item.count === 1 ? "home" : "homes"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div
                  onClick={() => {
                    setIsFocused(false);
                    if (onSearchSubmit) onSearchSubmit(internalQuery);
                  }}
                  className="p-6 text-center cursor-pointer hover:bg-nordic-dark/[0.02] transition-colors"
                >
                  <span className="material-icons text-3xl text-mosque mb-1 block">
                    search
                  </span>
                  <p className="text-sm font-medium text-nordic-dark">
                    {dict?.search || "Search"} &quot;{internalQuery}&quot;
                  </p>
                  <p className="text-xs text-nordic-muted mt-1">
                    Press <kbd className="px-1.5 py-0.5 bg-nordic-dark/5 rounded text-[10px] font-semibold text-nordic-dark">Enter</kbd> or click to search by property title.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Pills & Filters */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4 relative z-10">
          {CATEGORIES.map((category) => {
            const isActive = Boolean(
              selectedCategory && selectedCategory.toLowerCase() === category.value.toLowerCase()
            );
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => handleCategoryClick(category.value)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-nordic-dark text-white shadow-lg shadow-nordic-dark/10 scale-105"
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
