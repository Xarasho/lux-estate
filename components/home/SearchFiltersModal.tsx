"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";

export interface FilterValues {
  location: string;
  minPrice?: number;
  maxPrice?: number;
  category: string;
  beds?: number;
  baths?: number;
  amenities: string[];
}

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: FilterValues;
  totalHomesCount?: number;
  onApply: (values: FilterValues) => void;
}

const AMENITY_OPTIONS = [
  { id: "pool", label: "Swimming Pool", icon: "pool" },
  { id: "gym", label: "Gym", icon: "fitness_center" },
  { id: "parking", label: "Parking", icon: "local_parking" },
  { id: "ac", label: "Air Conditioning", icon: "ac_unit" },
  { id: "wifi", label: "High-speed Wifi", icon: "wifi" },
  { id: "patio", label: "Patio / Terrace", icon: "deck" },
];

const PROPERTY_TYPES = [
  { label: "Any Type", value: "all" },
  { label: "House", value: "house" },
  { label: "Apartment", value: "apartment" },
  { label: "Condo", value: "condo" },
  { label: "Townhouse", value: "townhouse" },
  { label: "Villa", value: "villa" },
  { label: "Penthouse", value: "penthouse" },
];

const SLIDER_MIN = 0;
const SLIDER_MAX = 15000000;
const SLIDER_STEP = 50000;

function formatPriceShort(val: number): string {
  if (val >= 1000000) {
    const m = val / 1000000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (val >= 1000) {
    return `$${Math.round(val / 1000)}K`;
  }
  return `$${val.toLocaleString("en-US")}`;
}

export function SearchFiltersModal({
  isOpen,
  onClose,
  initialValues,
  totalHomesCount,
  onApply,
}: SearchFiltersModalProps) {
  const [location, setLocation] = useState(initialValues.location || "");
  const [minPrice, setMinPrice] = useState<number>(initialValues.minPrice ?? 1200000);
  const [maxPrice, setMaxPrice] = useState<number>(initialValues.maxPrice ?? 4500000);
  const [category, setCategory] = useState(initialValues.category || "all");
  const [beds, setBeds] = useState<number>(initialValues.beds ?? 0);
  const [baths, setBaths] = useState<number>(initialValues.baths ?? 0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialValues.amenities || []
  );

  const [liveCount, setLiveCount] = useState<number | null>(totalHomesCount ?? null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocation(initialValues.location || "");
      setMinPrice(initialValues.minPrice ?? 1200000);
      setMaxPrice(initialValues.maxPrice ?? 4500000);
      setCategory(initialValues.category || "all");
      setBeds(initialValues.beds ?? 0);
      setBaths(initialValues.baths ?? 0);
      setSelectedAmenities(
        initialValues.amenities && initialValues.amenities.length > 0
          ? initialValues.amenities
          : ["Swimming Pool", "High-speed Wifi"] // default visual selection from design
      );
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialValues]);

  // Fetch dynamic matching homes count when filters change
  const fetchLiveCount = useCallback(async () => {
    try {
      setIsLoadingCount(true);
      const params = new URLSearchParams();
      if (location.trim()) params.set("search", location.trim());
      if (category && category !== "all") params.set("category", category);
      if (minPrice > 0) params.set("minPrice", minPrice.toString());
      if (maxPrice > 0 && maxPrice < SLIDER_MAX) params.set("maxPrice", maxPrice.toString());
      if (beds > 0) params.set("beds", beds.toString());
      if (baths > 0) params.set("baths", baths.toString());
      if (selectedAmenities.length > 0) {
        params.set("amenities", selectedAmenities.join(","));
      }

      const res = await fetch(`/api/properties/count?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLiveCount(data.count);
      }
    } catch (e) {
      console.warn("Failed to fetch live count:", e);
    } finally {
      setIsLoadingCount(false);
    }
  }, [location, category, minPrice, maxPrice, beds, baths, selectedAmenities]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchLiveCount();
    }, 250);
    return () => clearTimeout(timer);
  }, [isOpen, fetchLiveCount]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const toggleAmenity = (label: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  const handleClearAll = () => {
    setLocation("");
    setMinPrice(0);
    setMaxPrice(SLIDER_MAX);
    setCategory("all");
    setBeds(0);
    setBaths(0);
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApply({
      location: location.trim(),
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < SLIDER_MAX ? maxPrice : undefined,
      category,
      beds: beds > 0 ? beds : undefined,
      baths: baths > 0 ? baths : undefined,
      amenities: selectedAmenities,
    });
    onClose();
  };

  // Slider calculations
  const minPercent = useMemo(() => {
    return Math.max(0, Math.min(100, (minPrice / SLIDER_MAX) * 100));
  }, [minPrice]);

  const maxPercent = useMemo(() => {
    return Math.max(0, Math.min(100, (maxPrice / SLIDER_MAX) * 100));
  }, [maxPrice]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background blurred overlay */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Container matching code.html */}
      <main className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-30">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Filters
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
            aria-label="Close filters"
          >
            <span className="material-icons">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">
          {/* Section 1: Location */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Location
            </label>
            <div className="relative group">
              <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#006611] transition-colors">
                location_on
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-[#f5f8f6] dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#006611] focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm outline-none"
                placeholder="City, neighborhood, or address"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </section>

          {/* Section 2: Price Range */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price Range
              </label>
              <span className="text-sm font-medium text-[#006611]">
                {formatPriceShort(minPrice)} – {formatPriceShort(maxPrice)}
              </span>
            </div>

            {/* Slider Visual + Dual Range Track */}
            <div className="relative h-12 flex items-center mb-6 px-2">
              {/* Background Track */}
              <div className="absolute w-[calc(100%-1rem)] left-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006611]"
                  style={{
                    marginLeft: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />
              </div>

              {/* Visual Handles matching design */}
              <div
                className="absolute w-6 h-6 bg-white border-2 border-[#006611] rounded-full shadow-md pointer-events-none -ml-3 z-10"
                style={{ left: `calc(0.5rem + ${minPercent * 0.96}%)` }}
              />
              <div
                className="absolute w-6 h-6 bg-white border-2 border-[#006611] rounded-full shadow-md pointer-events-none -ml-3 z-10"
                style={{ left: `calc(0.5rem + ${maxPercent * 0.96}%)` }}
              />

              {/* Dual Range Native Sliders (layered transparently for native drag interaction) */}
              <input
                type="range"
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={SLIDER_STEP}
                value={minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxPrice - SLIDER_STEP);
                  setMinPrice(val);
                }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
              />
              <input
                type="range"
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={SLIDER_STEP}
                value={maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minPrice + SLIDER_STEP);
                  setMaxPrice(val);
                }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
              />
            </div>

            {/* Min / Max Price Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f5f8f6] dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-[#006611]/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">
                  Min Price
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm outline-none"
                    type="text"
                    value={minPrice.toLocaleString("en-US")}
                    onChange={(e) => {
                      const numeric = Number(e.target.value.replace(/[^0-9]/g, ""));
                      if (!isNaN(numeric)) setMinPrice(numeric);
                    }}
                  />
                </div>
              </div>
              <div className="bg-[#f5f8f6] dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-[#006611]/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">
                  Max Price
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm outline-none"
                    type="text"
                    value={maxPrice.toLocaleString("en-US")}
                    onChange={(e) => {
                      const numeric = Number(e.target.value.replace(/[^0-9]/g, ""));
                      if (!isNaN(numeric)) setMaxPrice(numeric);
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Property Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Type */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Property Type
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#f5f8f6] dark:bg-gray-800 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-[#006611] cursor-pointer outline-none"
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
                <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Rooms */}
            <div className="space-y-4">
              {/* Bedrooms */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Bedrooms
                </span>
                <div className="flex items-center space-x-3 bg-[#f5f8f6] dark:bg-gray-800 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setBeds((b) => Math.max(0, b - 1))}
                    disabled={beds <= 0}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#006611] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-7 text-center">
                    {beds > 0 ? `${beds}+` : "Any"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBeds((b) => Math.min(10, b + 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-[#006611] hover:bg-[#006611] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Bathrooms
                </span>
                <div className="flex items-center space-x-3 bg-[#f5f8f6] dark:bg-gray-800 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setBaths((b) => Math.max(0, b - 1))}
                    disabled={baths <= 0}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#006611] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-7 text-center">
                    {baths > 0 ? `${baths}+` : "Any"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBaths((b) => Math.min(10, b + 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-[#006611] hover:bg-[#006611] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Amenities & Features */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Amenities &amp; Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity.label);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.label)}
                    className="cursor-pointer group relative text-left outline-none"
                  >
                    <div
                      className={`h-full px-4 py-3 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                        isChecked
                          ? "border-[#006611] bg-[#006611]/5 dark:bg-[#006611]/20 text-[#006611] shadow-sm"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <span
                        className={`material-icons text-lg transition-colors ${
                          isChecked
                            ? "text-[#006611]"
                            : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      >
                        {amenity.icon}
                      </span>
                      <span>{amenity.label}</span>
                    </div>
                    {/* Top right active dot */}
                    {isChecked && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#006611] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors underline decoration-gray-300 underline-offset-4 cursor-pointer"
          >
            Clear all filters
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-[#006611] hover:bg-[#006611]/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-[#006611]/30 transition-all hover:shadow-[#006611]/40 flex items-center gap-2 transform active:scale-95 cursor-pointer disabled:opacity-75"
          >
            {isLoadingCount ? (
              <span>Updating...</span>
            ) : liveCount !== null ? (
              <span>
                Show {liveCount} {liveCount === 1 ? "Home" : "Homes"}
              </span>
            ) : (
              <span>Show Homes</span>
            )}
            <span className="material-icons text-sm">arrow_forward</span>
          </button>
        </footer>
      </main>
    </div>
  );
}
