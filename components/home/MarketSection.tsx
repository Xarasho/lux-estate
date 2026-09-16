"use client";

import React from "react";
import { Property } from "@/types/property";
import { PropertyCard } from "./PropertyCard";
import { Pagination } from "./Pagination";

export interface MarketSectionProps {
  properties: Property[];
  selectedFilter: "all" | "sale" | "rent";
  onFilterChange: (filter: "all" | "sale" | "rent") => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  dict?: any;
}

export function MarketSection({
  properties,
  selectedFilter,
  onFilterChange,
  currentPage,
  totalPages,
  totalCount,
  dict,
}: MarketSectionProps) {
  return (
    <section>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            {dict?.market_title || "New in Market"}
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            {totalCount > 0
              ? `${totalCount} ${totalCount !== 1 ? (dict?.homes || "properties") : (dict?.home_singular || "property")}`
              : (dict?.market_subtitle || "Fresh opportunities added this week.")}
          </p>
        </div>

        {/* Filter Tabs (All / Buy / Rent) */}
        <div className="flex bg-white p-1 rounded-lg border border-nordic-dark/5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedFilter === "all"
                ? "bg-nordic-dark text-white shadow-sm"
                : "text-nordic-muted hover:text-nordic-dark"
            }`}
          >
            {dict?.navbar?.all || "All"}
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("sale")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedFilter === "sale"
                ? "bg-nordic-dark text-white shadow-sm"
                : "text-nordic-muted hover:text-nordic-dark"
            }`}
          >
            {dict?.navbar?.buy || "Buy"}
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("rent")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedFilter === "rent"
                ? "bg-nordic-dark text-white shadow-sm"
                : "text-nordic-muted hover:text-nordic-dark"
            }`}
          >
            {dict?.navbar?.rent || "Rent"}
          </button>
        </div>
      </div>

      {/* Grid of properties */}
      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-nordic-dark/5">
          <span className="material-icons text-5xl text-nordic-muted/40 mb-3 block">
            home_work
          </span>
          <p className="text-nordic-dark font-medium text-lg">
            {dict?.no_properties || "No properties found"}
          </p>
          <p className="text-nordic-muted text-sm mt-1">
            {dict?.no_properties_hint || "Try adjusting your search criteria or filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </section>
  );
}
