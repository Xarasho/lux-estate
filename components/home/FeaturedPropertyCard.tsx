"use client";

import React from "react";
import Link from "next/link";
import { Property } from "@/types/property";
import { HeartButton } from "@/components/ui/HeartButton";
import { Badge } from "@/components/ui/Badge";

export interface FeaturedPropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export function FeaturedPropertyCard({
  property,
  onSelect,
}: FeaturedPropertyCardProps) {
  const targetSlug = property.slug || property.id;
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <Link
      href={`/properties/${targetSlug}`}
      onClick={() => onSelect && onSelect(property)}
      className="block text-inherit no-underline"
    >
      <article className="group relative rounded-xl overflow-hidden shadow-soft bg-white cursor-pointer border border-nordic-dark/5 hover:border-hint-of-green transition-all duration-300 flex flex-col h-full">
      {/* Media Container */}
      <div className="aspect-[4/3] w-full overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.imageUrl}
          alt={property.imageAlt || property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badge */}
        {property.badge && (
          <div className="absolute top-4 left-4">
            <Badge variant="exclusive">{property.badge}</Badge>
          </div>
        )}

        {/* Favorite Heart Button */}
        <div className="absolute top-4 right-4">
          <HeartButton size="md" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-6 relative flex-grow flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4 mb-2">
          <div>
            <h3 className="text-xl font-medium text-nordic-dark group-hover:text-mosque transition-colors">
              {property.title}
            </h3>
            <p className="text-nordic-muted text-sm flex items-center gap-1 mt-1">
              <span className="material-icons text-sm">place</span>
              {property.location.city ? `${property.location.address}, ${property.location.city}` : property.location.address}
            </p>
          </div>
          <span className="text-xl font-semibold text-mosque whitespace-nowrap">
            {formattedPrice}
            {property.pricePeriod && (
              <span className="text-sm font-normal text-nordic-muted">
                /{property.pricePeriod === "month" ? "mo" : property.pricePeriod}
              </span>
            )}
          </span>
        </div>

        {/* Specs Footer */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-nordic-dark/5">
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">king_bed</span>
            <span>{property.features.beds} Beds</span>
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">bathtub</span>
            <span>{property.features.baths} Baths</span>
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">square_foot</span>
            <span>{property.features.sqm.toLocaleString()} m²</span>
          </div>
        </div>
      </div>
    </article>
  </Link>
  );
}
