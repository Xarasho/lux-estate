"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface PropertyMapProps {
  lat?: number;
  lng?: number;
  title: string;
  address: string;
  priceFormatted: string;
}

export function PropertyMap({
  lat = 37.4419,
  lng = -122.143,
  title,
  address,
  priceFormatted,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 14);
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Add minimal zoom control in top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // CartoDB Voyager luxury clean tile layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Custom LuxeEstate Pin marker
    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="
          width: 34px; 
          height: 34px; 
          background-color: #006655; 
          border: 3px solid #ffffff; 
          border-radius: 9999px; 
          box-shadow: 0 4px 12px rgba(0, 102, 85, 0.4); 
          display: flex; 
          align-items: center; 
          justify-content: center;
        ">
          <span class="material-icons" style="color: #ffffff; font-size: 16px;">home</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    marker
      .bindPopup(
        `
        <div style="font-family: inherit; padding: 4px 2px; min-width: 140px;">
          <h4 style="margin: 0 0 4px 0; font-weight: 600; font-size: 13px; color: #19322F;">${title}</h4>
          <div style="color: #006655; font-weight: 700; font-size: 14px; margin-bottom: 2px;">${priceFormatted}</div>
          <div style="color: #5C706D; font-size: 11px;">${address}</div>
        </div>
      `,
        { closeButton: false }
      )
      .openPopup();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, title, address, priceFormatted]);

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        <a
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-xs font-medium px-2.5 py-1 rounded shadow-sm text-nordic hover:text-mosque transition-colors z-[400] flex items-center gap-1"
        >
          <span>View on Map</span>
          <span className="material-icons text-[12px]">open_in_new</span>
        </a>
      </div>
    </div>
  );
}

export default PropertyMap;
