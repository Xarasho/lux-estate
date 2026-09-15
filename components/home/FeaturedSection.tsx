"use client";

import React from "react";
import { Property } from "@/types/property";
import { FeaturedPropertyCard } from "./FeaturedPropertyCard";

export interface FeaturedSectionProps {
  properties: Property[];
  onViewAll?: () => void;
}

export function FeaturedSection({
  properties,
  onViewAll,
}: FeaturedSectionProps) {
  if (properties.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            Featured Collections
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            Curated properties for the discerning eye.
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-75 transition-opacity"
        >
          View all <span className="material-icons text-sm">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {properties.map((property) => (
          <FeaturedPropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
