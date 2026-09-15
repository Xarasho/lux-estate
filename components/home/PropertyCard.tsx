"use client";

import React from "react";
import { Property } from "@/types/property";
import { HeartButton } from "@/components/ui/HeartButton";
import { Badge } from "@/components/ui/Badge";

export interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  className?: string;
}

export function PropertyCard({
  property,
  onSelect,
  className = "",
}: PropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const badgeVariant =
    property.type === "rent" ? "for-rent" : "for-sale";
  const badgeLabel =
    property.badge || (property.type === "rent" ? "FOR RENT" : "FOR SALE");

  return (
    <article
      onClick={() => onSelect && onSelect(property)}
      className={`bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col border border-nordic-dark/5 hover:border-nordic-dark/10 ${className}`}
    >
      {/* Media & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.imageUrl}
          alt={property.imageAlt || property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute top-3 right-3">
          <HeartButton size="sm" />
        </div>

        <div className="absolute bottom-3 left-3">
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-bold text-lg text-nordic-dark">
            {formattedPrice}
            {property.pricePeriod && (
              <span className="text-sm font-normal text-nordic-muted">
                /{property.pricePeriod === "month" ? "mo" : property.pricePeriod}
              </span>
            )}
          </h3>
        </div>

        <h4 className="text-nordic-dark font-medium truncate mb-1 group-hover:text-mosque transition-colors">
          {property.title}
        </h4>

        <p className="text-nordic-muted text-xs mb-4">
          {property.location.city
            ? `${property.location.address}, ${property.location.city}`
            : property.location.address}
        </p>

        {/* Specs Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">
              king_bed
            </span>
            <span>{property.features.beds}</span>
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">
              bathtub
            </span>
            <span>{property.features.baths}</span>
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">
              square_foot
            </span>
            <span>{property.features.sqm}m²</span>
          </div>
        </div>
      </div>
    </article>
  );
}
