"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PropertyImage } from "@/types/property";

export interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
  badge?: string;
  type?: "sale" | "rent";
}

export function PropertyGallery({
  images,
  title,
  badge,
  type,
}: PropertyGalleryProps) {
  // Normalize images list (at least 1 image)
  const galleryImages =
    images && images.length > 0
      ? images
      : [
          {
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjNDU9iE4zwPuWeg-CjIrLI-87GF24_LgOggcXT0vmUYfMx2q1dJAheiqWqVN-39uiwyLKEfP18FsG1vtUyAPX902OhGEfM4clcQiDsJW7MBbc_BoMtZXtqIeFKIfkHnkIPwmFbQg8Eaan6ULV99T8AUVUuKsro0HoTMrIaxw5pp1uSuQlF8X5Dait4US1W4vmyZnVioXbFnCoaOOZ0LPorb0rVGAIQd9reWcpqq27C0oO4ltnsCTHIcjIm0xp-2qVbRJSIZzWPv0",
            alt: title,
            label: "Exterior",
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = galleryImages[currentIndex] || galleryImages[0];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  }, [galleryImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, handleNext, handlePrev]);

  return (
    <div className="space-y-4">
      {/* Main Showcase Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage.url}
          alt={activeImage.alt || title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            {badge || "Premium"}
          </span>
          <span className="bg-white/90 backdrop-blur text-nordic text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            {type === "rent" ? "For Rent" : "For Sale"}
          </span>
        </div>

        {/* View All Photos Button */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2 cursor-pointer z-10"
        >
          <span className="material-icons text-sm">grid_view</span>
          View All Photos ({galleryImages.length})
        </button>
      </div>

      {/* Thumbnails Row (1 to N images supported) */}
      {galleryImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto hide-scroll pb-2 snap-x">
          {galleryImages.map((img, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`flex-none w-44 sm:w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-all snap-start relative text-left ${
                  isSelected
                    ? "ring-2 ring-mosque ring-offset-2 ring-offset-clear-day opacity-100"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt || `${title} photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {img.label && (
                  <span className="absolute bottom-1 left-1.5 bg-black/60 backdrop-blur text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    {img.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-sm"
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center text-white max-w-7xl mx-auto w-full">
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-xs text-white/70">
                Photo {currentIndex + 1} of {galleryImages.length}
                {activeImage.label ? ` • ${activeImage.label}` : ""}
              </p>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Close photo viewer"
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <span className="material-icons text-2xl">close</span>
            </button>
          </div>

          {/* Main Photo Center */}
          <div className="relative flex-grow flex items-center justify-center max-w-6xl mx-auto w-full my-4">
            {galleryImages.length > 1 && (
              <button
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white z-20 backdrop-blur transition-all cursor-pointer"
              >
                <span className="material-icons text-2xl">chevron_left</span>
              </button>
            )}

            <div className="max-h-[75vh] max-w-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.url}
                alt={activeImage.alt || title}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {galleryImages.length > 1 && (
              <button
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white z-20 backdrop-blur transition-all cursor-pointer"
              >
                <span className="material-icons text-2xl">chevron_right</span>
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 justify-center overflow-x-auto hide-scroll py-2 max-w-4xl mx-auto w-full">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 h-12 rounded overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                    idx === currentIndex
                      ? "ring-2 ring-white scale-105"
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
